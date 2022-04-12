import express from "express";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGE } from "../store";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import logging from "../logging";
import mongoose from "mongoose";
const router = express.Router();

const fileStorage = new GridFsStorage({
  url: mongoose.connection,
  options: { newUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    var mediaID = uuidv4();
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size exceeded 10MB");
    }
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      console.log("saving with this name...", mediaID);
      return { bucketName: "photos", filename: `${mediaID}` };
    } else {
      throw new Error("File type is different");
    }
  },
});

router.post("/upload", async (req, res) => {
  //res.send(req.file);
  const upload = multer({ fileStorage });
  upload.single("file")(req, res, (err) => {
    console.log(req.file);
    if (err) {
      res.send(ERROR_MESSAGE(err.message));
    } else {
      console.log("check MEDIAID", res.req.file.filename);
      res.send(res.req.file.filename);
    }
  });
});

router.get("/access/:mediaID", async (req, res) => {
  const files = mongoose.connection.db.collection("photos.files");
  //const fileChunks = mongoose.connection.db.collection("photos.chunks");
  const mediaID = req.params.mediaID;
  const file = files.find({ filename: mediaID }).toArray((err, docs) => {
    if (err) {
      res.send(ERROR_MESSAGE("error finding chunks"));
    }
    if (!docs) {
      res.send(ERROR_MESSAGE("file not found"));
    }
    logging.info(file);
    res.send(file);
  });
});
// router.post("/upload", async (req, res) => {
//   //const file = req.body.ops[0].insert.image;
//   // Need to check the income data's format
//   try {
//     const file = req.body;
//     var imagePattern = new RegExp("/9j/[a-zA-z0-9@:%_/+.~#?&//=]*");
//     var mimePattern = new RegExp("image/jpg|image/png");
//     var mime = mimePattern.exec(file)[0];
//     var image = imagePattern.exec(file)[0];
//     var mediaID = uuidv4();
//     await Images.create({
//       _id: mediaID,
//       file: image,
//       mime: mime,
//     });
//     res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
//     res.send(mediaID);
//   } catch {
//     res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
//     res.send(ERROR_MESSAGE(`Invalid Media Input`));
//   }
// });

// router.get("/access/:MEDIAID", async (req, res) => {
//   const mediaID = req.params.MEDIAID;
//   await Images.findById(mediaID).exec((err, doc) => {
//     if (err) {
//       res.send(ERROR_MESSAGE(`No matching doc found`));
//     }
//     const file = { image: `data:${doc.mime};base64,${doc.file}` };
//     res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
//     res.send(file);
//   });
// });
export default router;
