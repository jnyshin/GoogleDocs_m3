import express from "express";
import Docs from "../schema/docs";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { ERROR_MESSAGE } from "../store";
import logging from "../logging";
import { clients } from "../store";
import Delta from "quill-delta";

const router = express.Router();

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
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(html);
    } catch (err) {
      logging.error("fail to convert to HTML Format");
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
      logging.info(`Found doc id = ${docId}`);
      res.status(200).set({
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-CSE356": "61f9f57373ba724f297db6ba",
      });
      //{ content, version }, { presence }, { ack },
      const payload = { content: document.data.ops, version: document.version };
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
    } catch (err) {
      logging.error("fail to create event stream connection");
      logging.error(err);
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
      for (const delta of op) {
        const incomming = new Delta(delta);
        const document = await Docs.findById(docId);
        oldVersion = document.version;
        const old = new Delta(document.data);
        const newDelta = old.compose(incomming);
        await Docs.findByIdAndUpdate(docId, { data: newDelta });
      }

      await Docs.findByIdAndUpdate(docId, {
        version: version + 1,
      });
      const ack = { ack: op[op.length - 1] };
      if (version !== oldVersion) {
        res.send({ status: "retry" });
      }
      clients.forEach((client) => {
        if (client.id !== id && client.docId === docId) {
          client.res.write(`data: ${JSON.stringify(op)}\n\n`);
          client.res.write(`data: ${JSON.stringify(ack)}\n\n`);

          logging.info(`sent message to UID = ${client.id}`);
          logging.info(`sent: ${JSON.stringify(op)}`);
        }
      });

      res.send({ status: "OK" });
    } catch (err) {
      logging.error("failed to update OP");
      res.send(ERROR_MESSAGE("failed to update OP"));
      console.error(err);
    }
  }
});
export default router;
