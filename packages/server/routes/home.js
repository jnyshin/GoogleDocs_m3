import express from "express";
import path from "path";
import logging from "../logging";
import { ERROR_MESSAGE, __dirname } from "../store";

const client_path = path.join(__dirname, "../client/dist");
const router = express.Router();

router.get("/", async (req, res) => {
  logging.info("[/home] Route");
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  }
  res.sendFile(path.join(client_path, "index.html"));
});
export default router;
