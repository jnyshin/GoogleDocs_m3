import express from "express";
import { clients } from "../store";
const router = express.Router();

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const delta = req.body;

  res.send("hello");
  const payload = { action: "update", data: delta };
  clients.forEach((client) => {
    if (client.id !== id) {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  });
});

export default router;
