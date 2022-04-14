import express from "express";
import Docs from "../schema/docs";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../logging";
import { clients, client_path, ERROR_MESSAGE } from "../store";
import User from "../schema/user";
import Delta from "quill-delta";
import path from "path";
const router = express.Router();
router.get("/edit/:DOCID", (req, res) => {
  logging.info("[/doc/edit/:DOCID] Route");
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.sendFile(path.join(client_path, "index.html"));
  }
});

router.post("/presence/:DOCID/:UID", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/doc/presence/:DOCID/:UID] Route");
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
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send();
      clients.forEach((client) => {
        if (client.id !== id && client.docId === docId) {
          client.res.write(`data: ${JSON.stringify(presence)}\n\n`);
          logging.info(`sent message to UID = ${client.id}`);
          logging.info(`sent: ${JSON.stringify(presence)}`);
        }
      });
    } catch (err) {
      logging.error("Failed to send presence");
      logging.error(err);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Failed to send presence"));
    }
  }
});

router.get("/get/:DOCID/:UID", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
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
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(html);
    } catch (err) {
      logging.error("fail to convert to HTML Format");
      logging.error(err);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("fail to convert to HTML Format"));
    }
  }
});

router.get("/connect/:DOCID/:UID", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/doc/connect/:DOCID/:UID] Route");
    const docId = req.params.DOCID;
    const id = req.params.UID;
    try {
      const document = await Docs.findById(docId);
      if (document) {
        logging.info(`Found doc id = ${docId}`);
        res.status(200).set({
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "X-CSE356": "61f9f57373ba724f297db6ba",
        });
        const payload = {
          content: document.data.ops,
          version: document.version,
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
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
        req.on("close", () => {
          logging.info(`UID = ${id} connection closed`);
          clients.map((c, index) =>
            c.id === id ? clients.splice(index, 1) : clients
          );
          logging.info(`remaining clients = ${clients.length}`);
        });
      } else {
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send(ERROR_MESSAGE(`Did not find matching doc for id =${docId}`));
      }
    } catch (err) {
      logging.error("fail to create event stream connection");
      logging.error(err);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE(err));
    }
  }
});
router.post("/op/:DOCID/:UID", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/doc/op/:DOCID/:UID] Route");
    const id = req.params.UID;
    const docId = req.params.DOCID;
    const version = req.body.version;
    const op = req.body.op;
    let oldVersion;
    logging.info(`Incoming Version = ${version}`);
    logging.info(op);
    try {
      const incomming = new Delta(op);
      logging.info("Incomming Delta: ");
      logging.info(incomming);
      const document = await Docs.findById(docId);
      oldVersion = document.version;
      const old = new Delta(document.data);
      const newDelta = old.compose(incomming);
      logging.info("newDelta Delta: ");
      logging.info(newDelta);
      await Docs.findByIdAndUpdate(docId, { data: newDelta });

      await Docs.findByIdAndUpdate(docId, {
        version: version + 1,
      });
      const ack = { ack: op };
      if (version !== oldVersion) {
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "retry" });
      } else {
        clients.forEach((client) => {
          if (client.id !== id && client.docId === docId) {
            client.res.write(`data: ${JSON.stringify(op)}\n\n`);
            client.res.write(`data: ${JSON.stringify(ack)}\n\n`);

            logging.info(`sent message to UID = ${client.id}`);
            logging.info(`sent op: ${JSON.stringify(op)}`);
            logging.info(`sent ack: ${JSON.stringify(ack)}`);
          }
        });
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "ok" });
      }
    } catch (err) {
      logging.error("failed to update OP");
      logging.error(err);
      res.send(ERROR_MESSAGE("failed to update OP"));
    }
  }
});
export default router;
