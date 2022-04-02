import express from "express";
import Conn from "../schema_conn";
import clients from "../store";

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

  const document = await findOrCreateDocument(id);
  const data = `data: ${JSON.stringify(document.data)}\n\n`;
  res.write(data);

  const newClient = {
    id: id,
    res,
  };
  clients.push({ ...newClient });
  req.on("close", () => {
    console.log(`${id} Connection closed`);
    clients.filter((c) => id !== c.id);
  });
});

const findOrCreateDocument = async (id) => {
  if (id == null) return;

  const document = await Conn.findById(id);
  if (document) return document;
  return await Conn.create({
    _id: id,
    data: { ops: [{ insert: "test" }] },
    doc: "<p>Check /doc/id</p>",
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
