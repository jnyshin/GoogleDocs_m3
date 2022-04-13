import express from "express";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGE } from "../store";
import multer from "multer";
import Images from "../schema/images";
import logging from "../logging";
import { __dirname } from "../store";
import path from "path";
const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[media/upload] Route");
    const file = req.file;
    if (!file) {
      logging.error("Did not upload a file");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Please upload a file"));
    }
    try {
      const mediaId = uuidv4();
      await Images.create({
        _id: mediaId,
        file: file.path,
        mime: file.mimetype,
      });
      logging.info(`Created image with _id = ${mediaId}`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(mediaId);
    } catch (err) {
      logging.error(err);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Error while creating Image Object"));
    }
  }
});

router.get("/access/:mediaID", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    try {
      logging.info("[/access/:mediaID] Route");
      const mediaID = req.params.mediaID;
      const image = await Images.findById(mediaID);
      const pathToImage = path.join(__dirname, image.file);
      logging.info(`requested Image path = ${pathToImage}`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.sendFile(pathToImage);
    } catch (err) {
      logging.error("Error while sending image");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Error while sending image"));
    }
  }
});

export default router;
