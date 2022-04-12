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
  logging.info("[media/upload] Route");
  const file = req.file;
  if (!file) {
    logging.error("Did not upload a file");
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
    res.send(mediaId);
  } catch (err) {
    logging.error(err);
    res.send(ERROR_MESSAGE("Error while creating Image Object"));
  }
});

router.get("/access/:mediaID", async (req, res) => {
  logging.info("[media/access/:mediaID] Route");
  try {
    const mediaID = req.params.mediaID;
    const image = await Images.findById(mediaID);
    const pathToImage = path.join(__dirname, image.file);
    logging.info(`requested Image path = ${pathToImage}`);
    res.sendFile(pathToImage);
  } catch (err) {
    logging.error("Error while sending image");
    res.send(ERROR_MESSAGE("Error while sending image"));
  }
  // const files = mongoose.connection.db.collection("photos.files");
  //const fileChunks = mongoose.connection.db.collection("photos.chunks");
  // const file = files.find({ filename: mediaID }).toArray((err, docs) => {
  //   if (err) {
  //     res.send(ERROR_MESSAGE("error finding chunks"));
  //   }
  //   if (!docs) {
  //     res.send(ERROR_MESSAGE("file not found"));
  //   }
  //   logging.info(file);
  //   res.send(file);
  // });
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
