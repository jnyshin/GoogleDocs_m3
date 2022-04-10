import express from "express";
import { clients } from "../store";
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
    const document = await Docs.findById(id);
    const old = new Delta(document.data);
    const newDelta = old.compose(incomming);
    await Docs.findByIdAndUpdate(id, { data: newDelta }).then(
      console.log("Document saved")
    );
  }
  clients.forEach((client) => {
    if (client.id !== id) {
      client.res.write(`data: ${JSON.stringify(req.body)}\n\n`);
      //console.log(`sent message: ${JSON.stringify(req.body)}\n\n`);
    }
  });
  res.send("success");
});

export default router;
