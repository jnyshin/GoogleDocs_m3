import express from "express";
import Conn from "../schema_conn";
import { clients, DOCUMENT_ID } from "../store";

const router = express.Router();
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`start ending event stream for ${id}... `);
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });

  res.flushHeaders();

  const document = await findOrCreateDocument();
  const payload = { action: "set", data: document.data };
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  res.write(data);
  console.log("length: " + clients.length);
  const newClient = {
    id: id,
    res,
  };

  clients.push(newClient);

  req.on("close", () => {
    console.log("why close?");
  });
});

const findOrCreateDocument = async () => {
  const document = await Conn.findById(DOCUMENT_ID);
  if (document) return document;
  return await Conn.create({
    _id: DOCUMENT_ID,
    doc: "<p>Check /doc/id</p>",
    data: { ops: [{ insert: "test" }] },
  });
};

router.get("/doc/:id", async (req, res) => {
  console.log("doc router reached");
  const id = req.params.id;
  //console.log(id);
  Conn.findOne({ _id: id }).exec((err, doc) => {
    if (doc) {
      //console.log(doc);
      res.send(doc);
    } else {
      //console.log(err);
      res.send("ERROR");
    }
  });
});

export default router;
