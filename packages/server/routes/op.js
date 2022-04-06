import express from "express";
import { clients, DOCUMENT_ID } from "../store";
import Delta from "quill-delta";
import Conn from "../schema_conn";

const router = express.Router();

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  let count = 0;
  const deltas = [];
  for (const delta of req.body) {
    console.log(count);
    console.log(delta);
    count += 1;
    deltas.push(delta);
    const incomming = new Delta(delta);
    //console.log("incomming delta.. ", incomming);
    const document = await Conn.findById(DOCUMENT_ID);
    const old = new Delta(document.data);
    //console.log("old delta...", old);
    const newDelta = old.compose(incomming);
    //console.log("new delta ..", newDelta);
    await Conn.findByIdAndUpdate(DOCUMENT_ID, { data: newDelta }).then(
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
