import Docs from "../../schema/docs.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../../logging.js";
import { currEditDoc, clients, ERROR_MESSAGE } from "../../store.js";
import User from "../../schema/user.js";
import Delta from "quill-delta";
import fastJson from "fast-json-stringify";

export default async (fastify, opts) => {
  fastify.get("/edit/:DOCID", async (req, res, next) => {
    const docId = req.params.DOCID;
    logging.info("[/doc/edit/:DOCID] Route");
    logging.info(`Requested from ${docId}`);
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return res.sendFile("index.html");
  });

  fastify.post("/presence/:DOCID/:UID", async (req, res) => {
    logging.info("[/doc/presence/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    const id = req.params.UID;
    const { index, length } = req.body;
    logging.info(`Request with index=${index}, length=${length}`, id);
    try {
      const _id = req.session.user.id;
      logging.info(`session user id = ${_id}`, id);
      const user = await User.findById(_id);
      logging.info(`found user`, id);
      logging.info(user, id);
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
      logging.info("presence: ", id);
      logging.info(presence, id);
      const stringify = fastJson({
        title: "presence",
        type: "object",
        properties: {
          presense: {
            type: "object",
            properties: {
              id: { type: "string" },
              cursor: {
                type: "object",
                properties: {
                  index: { type: "number" },
                  length: { type: "number" },
                  name: { type: "string" },
                },
              },
            },
          },
        },
      });
      clients.forEach((client) => {
        if (client.id !== id && client.docId === docId) {
          client.res.raw.write(`data: ${stringify(presence)}\n\n`);
          logging.info(`sent message to UID = ${client.id}`, id);
          logging.info(`sent: ${stringify(presence)}`, id);
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
    logging.info("[/doc/get/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    // Not sure what uid is for
    const uid = req.params.UID;
    try {
      const doc = await Docs.findById(docId);
      const ops = doc.data.ops;
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
    try {
      const document = await Docs.findById(docId);
      if (document) {
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
        const stringify = fastJson({
          title: "initial content w/ version",
          type: "object",
          properties: {
            content: { type: "array" },
            version: { type: "number" },
          },
        });
        res.raw.write(`data: ${stringify(payload)}\n\n`);
        logging.info(`Event Stream connection open for UID = ${id}`);
        logging.info(`[Pushed data]`);
        logging.info(payload);
        const newClient = {
          id: id,
          docId: docId,
          res,
        };
        clients.push(newClient);
        logging.info(`Current connected clients = ${clients.length}`);
        req.raw.on("close", () => {
          logging.info(`UID = ${id} connection closed`);
          clients.map((c, index) =>
            c.id === id ? clients.splice(index, 1) : clients
          );
          logging.info(`remaining clients = ${clients.length}`);
        });
        res.sent = true;
      } else {
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE(`Did not find matching doc for id =${docId}`);
      }
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

    logging.info(`Incoming Version = ${version}`, id);
    logging.info(`Incoming op =`, id);
    logging.info(op, id);
    try {
      const document = await Docs.findById(docId);
      logging.info(`Document Version = ${document.version}`, id);
      if (version !== document.version || currEditDoc[0] === docId) {
        logging.info(
          `Version is not matched. client = ${version}, server=${document.version}. OR This doc is being edited right now`,
          id
        );
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        logging.info("sending { status: retry }", id);
        return { status: "retry" };
      } else {
        currEditDoc.push(docId);
        const incomming = new Delta(op);
        logging.info("Incomming Delta from : ", id);
        logging.info(incomming, id);
        const old = new Delta(document.data);
        const newDelta = old.compose(incomming);
        await Docs.findByIdAndUpdate(docId, {
          $set: { data: newDelta },
          $inc: { version: 1 },
        });
        const newDocument = await Docs.findById(docId);
        logging.info("NEW DOCUMENT:", id);
        logging.info(newDocument, id);
        logging.info(`Old version - ${newDocument.version - 1}`, id);
        logging.info(`New version - ${newDocument.version}`, id);
        const ack = { ack: op };
        const stringify = fastJson({
          title: "ack",
          type: "object",
          properties: {
            ack: { type: "array" },
          },
        });
        const stringify2 = fastJson({
          title: "op",
          type: "array",
        });
        logging.info("Sending ACK", id);
        logging.info("Sending OP", id);
        clients.forEach((client) => {
          if (client.id === id) {
            logging.info(`Sending ACK to UID = ${client.id}`, id);
            logging.info(`sent ack: ${stringify(ack)}`, id);
            client.res.raw.write(`data: ${stringify(ack)}\n\n`);
          }
          if (client.docId === docId && client.id !== id) {
            logging.info(`Sending OP to UID = ${client.id}`, id);
            logging.info(`sent op: ${stringify2(op)}`, id);
            client.res.raw.write(`data: ${stringify2(op)}\n\n`);
          }
        });
        logging.info("sending { status: ok }", id);
        currEditDoc.pop();
        logging.info(
          `currEditDoc is reset with length ${currEditDoc.length}`,
          id
        );
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
