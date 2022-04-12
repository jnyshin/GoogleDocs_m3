import express from "express";
import { clients } from "../store";
import Delta from "quill-delta";
import Docs from "../schema/docs";
import { ERROR_MESSAGE } from "../store";

const router = express.Router();
router.get("/showlist", async (req, res) => {
  const docs = Docs.find();
  res.send(docs);
});
router.post("/:docId/:id", async (req, res) => {
  //client Id
  const id = req.params.id;
  //Document Id
  const docId = req.params.docId;
  for (const delta of req.body) {
    const incomming = new Delta(delta);
    const document = await Docs.findById(docId);
    const old = new Delta(document.data);
    const newDelta = old.compose(incomming);
    await Docs.findByIdAndUpdate(docId, { data: newDelta });
  }
  clients.forEach((client) => {
    if (client.id !== id && client.docId === docId) {
      client.res.write(`data: ${JSON.stringify(req.body)}\n\n`);
      //console.log(`sent message: ${JSON.stringify(req.body)}\n\n`);
    }
  });
  res.send("success");
});

export default router;
