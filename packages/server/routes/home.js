import express from "express";
import path from "path";
import { __dirname } from "../store";

const client_path = path.join(__dirname, "../client/dist");
const router = express.Router();

router.get("/", async (req, res) => {
  res.sendFile(path.join(client_path, "index.html"));
});
export default router;
