import express from "express";
import Docs from "../schema/docs";
import { clients } from "../store";

const router = express.Router();
router.get("/:id/:docId", async (req, res) => {
  const docId = req.params.docId;
  const id = req.params.id;
  const document = await Docs.findById(docId);

  // console.log("connection: ", id);
  // console.log(`start ending event stream for ${id}... `);
  res.status(200).set({
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "X-CSE356": "61f9f57373ba724f297db6ba",
  });
  const payload = { content: document.data.ops };

  res.write(`data: ${JSON.stringify(payload)}\n\n`);
  // console.log("check format: ", JSON.stringify(payload));
  const newClient = {
    id: id,
    docId: docId,
    res,
  };
  clients.push(newClient);
  req.on("close", () => {
    // console.log(`${id} Connection closed`);
    clients.map((c, index) =>
      c.id === id ? clients.splice(index, 1) : clients
    );
    // console.log("remaining clients = " + clients.length);
  });
});

export default router;
