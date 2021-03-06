import Docs from "../schema/docs.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../logging.js";
import {
  ackStringify,
  clients,
  currDocDict,
  docSubmitOp,
  ELASTIC_INDEX,
  ERROR_MESSAGE,
  fetchDoc,
  opStringify,
  payloadStringify,
  presenceStringify,
} from "../store.js";
import User from "../schema/user.js";
import { connection, ESclient } from "../app.js";

export default async (fastify, opts) => {
  fastify.get("/edit/:DOCID", async (req, res, next) => {
    const docId = req.params.DOCID;
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return res.sendFile(
      process.env.NODE_ENV === "production"
        ? "/var/www/html/index.html"
        : "index.html"
    );
  });

  fastify.post("/presence/:DOCID/:UID", async (req, res) => {
    const docId = req.params.DOCID;
    const id = req.params.UID;
    const { index, length } = req.body;
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
          },
        },
      };
      clients.forEach((client) => {
        if (client.id !== id && client.docId === docId) {
          client.res.write(`data: ${presenceStringify(presence)}\n\n`);
        }
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
    const docId = req.params.DOCID;
    // Not sure what uid is for
    const uid = req.params.UID;
    try {
      const document = await fetchDoc(docId);
      const ops = document.data.ops;
      const converter = new QuillDeltaToHtmlConverter(ops, {});
      const html = converter.convert();
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
    const docId = req.params.DOCID;
    const id = req.params.UID;
    //logging.info("[/doc/connect/:DOCID/:UID] Route", id);
    try {
      const document = await fetchDoc(docId);
      //logging.info("fetched Doc", id);
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
      res.raw.write(`data: ${payloadStringify(payload)}\n\n`);
      const newClient = {
        id: id,
        docId: docId,
        res: res.raw,
      };
      clients.push(newClient);
      // logging.info(
      //   `Current connected clients = ${clients.length} for docId = ${docId}`
      // );
      req.raw.on("close", () => {
        logging.info(`UID = ${id} connection closed`);
        clients.map((c, index) =>
          c.id === id ? clients.splice(index, 1) : clients
        );
        logging.info(`remaining clients = ${clients.length}`);
      });
    } catch (err) {
      logging.error("fail to create event stream connection");
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(err);
    }
  });

  fastify.post("/op/:DOCID/:UID", async (req, res) => {
    const start = performance.now();
    const id = req.params.UID;
    const docId = req.params.DOCID;
    const version = req.body.version;
    const op = req.body.op;
    try {
      const document = await fetchDoc(docId);
      // if (version !== document.version) {
      //   res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      //   logging.info(
      //     `Client v=${version} != doc v=${document.version}: { status: retry }`,
      //     id
      //   );
      //   return { status: "retry" };
      // } else if (document.preventCompose) {
      //   res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      //   logging.info("Disrupting editing: { status: retry }", id);
      //   return { status: "retry" };
      // } else {
      // document.preventCompose = true;
      const ack = await docSubmitOp(document, op, id);
      clients.forEach((client) => {
        if (client.id === id) {
          client.res.write(`data: ${ackStringify(ack)}\n\n`);
        }
        if (client.docId === docId && client.id !== id) {
          client.res.write(`data: ${opStringify(op)}\n\n`);
        }
      });
      logging.info("{ status: ok }", id);
      // document.preventCompose = false;
      const duration = performance.now() - start;
      logging.info(`OP took ${duration}ms`);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return { status: "ok" };
      // }
    } catch (err) {
      logging.error("failed to update OP", id);
      logging.error(err);
      return ERROR_MESSAGE("failed to update OP");
    }
  });
};
