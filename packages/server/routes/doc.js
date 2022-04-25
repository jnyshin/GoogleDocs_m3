import Docs from "../schema/docs.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../logging.js";
import {
  ackStringify,
  clientStringify,
  docSubmitOp,
  ERROR_MESSAGE,
  fetchDoc,
  opStringify,
  payloadStringify,
  presenceStringify,
  SHARE_DB_NAME,
} from "../store.js";
import User from "../schema/user.js";
import IORedis from "ioredis";
import { connection } from "../app.js";

const pub = new IORedis();

export default async (fastify, opts) => {
  fastify.get("/edit/:DOCID", async (req, res, next) => {
    const docId = req.params.DOCID;
    logging.info("[/doc/edit/:DOCID] Route");
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return res.sendFile("index.html");
  });

  fastify.post("/presence/:DOCID/:UID", async (req, res) => {
    logging.info("[/doc/presence/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    const id = req.params.UID;
    const { index, length } = req.body;
    logging.info(`Request with index=${index}, length=${length}`, id);
    const { redis } = fastify;
    try {
      const _id = req.session.user.id;
      const user = await User.findById(_id);
      const presence = {
        presence: {
          id: id,
          cursor: {
            index: index,
            length: length,
            name: user.name,
            // name: "hasung",
          },
        },
      };
      const clients = await redis.lrange("clients", 0, -1);
      clients.map((c) => {
        const client = JSON.parse(c);
        if (client.id !== id && client.docId === docId)
          pub.publish(client.id, presenceStringify(presence));
      });
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return {};
    } catch (err) {
      logging.error("Failed to send presence");
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("Failed to send presence");
    }
  });

  fastify.get("/get/:DOCID/:UID", async (req, res) => {
    logging.info("[/doc/get/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    // Not sure what uid is for
    const uid = req.params.UID;
    try {
      const document = await fetchDoc(docId);
      const ops = document.data.ops;
      const converter = new QuillDeltaToHtmlConverter(ops, {});
      const html = converter.convert();
      logging.info("Sent HTML: ");
      logging.info(html);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return html;
    } catch (err) {
      logging.error("fail to convert to HTML Format");
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("fail to convert to HTML Format");
    }
  });

  fastify.get("/connect/:DOCID/:UID", async (req, res) => {
    logging.info("[/doc/connect/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    const id = req.params.UID;
    const { redis } = fastify;
    try {
      const document = await fetchDoc(docId);
      logging.info(`Found doc id = ${docId}`);
      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-CSE356": "61f9f57373ba724f297db6ba",
      };
      res.raw.writeHead(200, headers);
      const payload = {
        content: document.data.ops,
        version: document.version,
      };
      logging.info(`sent initial payload`);
      logging.info(payload);
      res.raw.write(`data: ${payloadStringify(payload)}\n\n`);
      const newClient = {
        id: id,
        docId: docId,
      };

      redis.lpush("clients", clientStringify(newClient));

      const sub = new IORedis();
      sub.subscribe(id, (err, count) => {
        if (err) {
          logging.error("Failed to subscribe: %s", err.message);
        } else {
          logging.info(
            `Subscribed successfully! This client is currently subscribed ${id}`
          );
        }
      });

      sub.on("message", (channel, message) => {
        logging.info("Subscriber got message", channel);
        logging.info(message, channel);
        res.raw.write(`data: ${message}\n\n`);
      });

      const clients = await redis.lrange("clients", 0, -1);
      logging.info(`Current connected clients = ${clients.length}`);
      req.raw.on("close", () => {
        logging.info(`UID = ${id} connection closed`);
        clients.map(async (c, index) => {
          const client = JSON.parse(c);
          if (client.id === id) {
            await redis.lrem("clients", 0, c);
          }
        });
        logging.info(`remaining clients = ${clients.length}`);
      });
      res.sent = true;
    } catch (err) {
      logging.error("fail to create event stream connection");
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(err);
    }
  });

  fastify.post("/op/:DOCID/:UID", async (req, res) => {
    const id = req.params.UID;
    logging.info("[/doc/op/:DOCID/:UID] Route", id);
    const docId = req.params.DOCID;
    const version = req.body.version;
    const op = req.body.op;
    const { redis } = fastify;

    try {
      const document = await fetchDoc(docId);
      if (version !== document.version) {
        logging.info(
          `Version is not matched. client = ${version}, server=${document.version}.`,
          id
        );
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        logging.info("{ status: retry }", id);
        return { status: "retry" };
      } else if (document.preventCompose) {
        logging.info("Someone is currently editing!");
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        logging.info("{ status: retry }", id);
        return { status: "retry" };
      } else {
        document.preventCompose = true;
        const ack = await docSubmitOp(document, op, id);
        const clients = await redis.lrange("clients", 0, -1);
        clients.map((c) => {
          const client = JSON.parse(c);
          if (client.id === id) {
            logging.info("Sending ACK", id);
            pub.publish(client.id, ackStringify(ack));
          }
          if (client.id !== id && client.docId === docId) {
            logging.info("Sending OP", client.id);
            pub.publish(client.id, opStringify(op));
          }
        });
        await Docs.findByIdAndUpdate(docId, {
          $inc: { version: 1 },
        });
        logging.info("{ status: ok }", id);
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return { status: "ok" };
      }
    } catch (err) {
      logging.error("failed to update OP", id);
      logging.error(err, id);
      return ERROR_MESSAGE("failed to update OP");
    }
  });
};
