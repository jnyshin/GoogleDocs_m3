import express from "express";
import path from "path";
import logging from "../logging";
import { client_path, ERROR_MESSAGE } from "../store";
const router = express.Router();

router.get("/", async (req, res) => {
  logging.info("[/home] Route");
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  }
  res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
  res.sendFile(path.join(client_path, "index.html"));
});
export default router;
