import express from "express";
//import { Connection } from "mongoose";
import { clients, DOCUMENT_ID } from "../store";
import Conn from "../schema_conn";
const router = express.Router();

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const contents = req.body.contents;
  console.log("server received");
  const delta = req.body.delta;
  const payload = { action: "update", data: delta };
  clients.forEach((client) => {
    if (client.id !== id) {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  });
  // await Conn.findByIdAndUpdate(DOCUMENT_ID, { data: contents }).then(
  //   console.log("Document saved")
  // );
});

export default router;
