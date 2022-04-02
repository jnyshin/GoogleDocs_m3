import express from "express";
import clients from "../store";
const router = express.Router();

router.post("/:id", async (req, res) => {
  const id = req.params.id;
  const client = clients.filter((c) => c.id === id)[0];
  const delta = req.body;
  const data = `data: ${JSON.stringify(delta)}\n\n`;
  client.res.write(data);
  // res.json(delta);
  res.send("hello");
});

export default router;
