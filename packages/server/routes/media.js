import express from "express";
import Images from "../schema/images";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGE } from "../store";
const router = express.Router();

router.post("/upload", async (req, res) => {
  //const file = req.body.ops[0].insert.image;
  // Need to check the income data's format
  try {
    const file = req.body;
    var imagePattern = new RegExp("/9j/[a-zA-z0-9@:%_/+.~#?&//=]*");
    var mimePattern = new RegExp("image/jpg|image/png");
    var mime = mimePattern.exec(file)[0];
    var image = imagePattern.exec(file)[0];
    var mediaID = uuidv4();
    await Images.create({
      _id: mediaID,
      file: image,
      mime: mime,
    });
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(mediaID);
  } catch {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE(`Invalid Media Input`));
  }
});

router.get("/access/:MEDIAID", async (req, res) => {
  const mediaID = req.params.MEDIAID;
  await Images.findById(mediaID).exec((err, doc) => {
    if (err) {
      res.send(ERROR_MESSAGE(`No matching doc found`));
    }
    const file = { image: `data:${doc.mime};base64,${doc.file}` };
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(file);
  });
});
export default router;
