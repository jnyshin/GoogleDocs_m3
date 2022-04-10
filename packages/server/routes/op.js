import express from "express";
import { clients, DOCUMENT_ID } from "../store";
import Delta from "quill-delta";
import Docs from "../schema/docs";

const router = express.Router();
router.get("/showlist", async (req, res) => {
  const docs = Docs.find();
  res.send(docs);
});
router.post("/:id", async (req, res) => {
  const id = req.params.id;
  for (const delta of req.body) {
    const incomming = new Delta(delta);
    const document = await Docs.findById(DOCUMENT_ID);
    const old = new Delta(document.data);
    const newDelta = old.compose(incomming);
    await Docs.findByIdAndUpdate(DOCUMENT_ID, { data: newDelta }).then(
      console.log("Document saved")
    );
  }
  clients.forEach((client) => {
    if (client.id !== id) {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  });
});

export default router;
