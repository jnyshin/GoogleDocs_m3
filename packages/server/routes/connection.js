import express from "express";
import Conn from "../schema_conn";
import { clients, DOCUMENT_ID } from "../store";

const router = express.Router();
router.get("/:id", async (req, res) => {
  const document = await Conn.findById(DOCUMENT_ID);

  const id = req.params.id;
  console.log("connection: ", id);
  console.log(`start ending event stream for ${id}... `);
  res.status(200).set({
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-CSE356": "61f9f57373ba724f297db6ba",
  });

  const payload = { content: document.data.ops };

  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  console.log("check format: ", JSON.stringify(payload));
  const newClient = {
    id: id,
    res,
  };

  clients.push(newClient);

  req.on("close", () => {
    console.log(`${id} Connection closed`);
    clients.map((c, index) =>
      c.id === id ? clients.splice(index, 1) : clients
    );
    console.log("remaining clients = " + clients.length);
  });
});

export default router;
