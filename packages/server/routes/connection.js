import express from "express";
import Conn from "../schema_conn";

const router = express.Router();

router.get("/connect/:id", async (req, res) => {
  const id = req.params.id;
  console.log(`start ending event stream for ${id}... `);
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  while (true) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const document = await findOrCreateDocument(id);
    const data = `data: ${JSON.stringify(document.data)}\n\n`;
    res.write(data);
  }
});

const findOrCreateDocument = async (id) => {
  if (id == null) return;

  const document = await Conn.findById(id);
  if (document) return document;
  return await Conn.create({ _id: id, data: { ops: [{ insert: "test" }] } });
};

export default router;
