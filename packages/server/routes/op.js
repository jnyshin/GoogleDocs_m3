import express from "express";
import { clients, DOCUMENT_ID } from "../store";
import Delta from "quill-delta";
import Conn from "../schema_conn";
const router = express.Router();

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  // const contents = req.body.contents;

  const _delta = req.body;
  const delta = new Delta(_delta);
  const document = await Conn.findById(DOCUMENT_ID);
  const oldDelta = new Delta(document.data);
  const newDelta = oldDelta.compose(delta);

  const payload = { action: "update", data: newDelta };
  res.send("success");
  clients.forEach((client) => {
    if (client.id !== id) {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  });
  console.log(delta);
  await Conn.findByIdAndUpdate(DOCUMENT_ID, { data: newDelta }).then(
    console.log("Document saved")
  );
});

export default router;
