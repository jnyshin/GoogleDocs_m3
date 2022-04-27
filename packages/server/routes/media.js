import { v4 as uuidv4 } from "uuid";
import multer from "fastify-multer";
import Images from "../schema/images.js";
import logging from "../logging.js";
import { __dirname, ERROR_MESSAGE } from "../store.js";
import { join } from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      process.env.NODE_ENV === "production"
        ? "/var/www/html/uploads"
        : join(__dirname, "dist", "uploads")
    );
  },

  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const upload = multer({ storage: storage });

export default async (fastify, opts) => {
  fastify.post(
    "/upload",
    { preHandler: upload.single("file") },
    async (req, res) => {
      logging.info("[media/upload] Route");
      const file = req.file;
      if (!file) {
        logging.error("Did not upload a file");
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE("Please upload a file");
      }
      logging.info(file);
      if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
        try {
          const mediaId = uuidv4();
          await Images.create({
            _id: mediaId,
            file:
              process.env.NODE_ENV === "production"
                ? `/var/www/html/uploads/${file.filename}`
                : `/uploads/${file.filename}`,
            mime: file.mimetype,
          });
          logging.info(`Created image with _id = ${mediaId}`);
          res.header("X-CSE356", "61f9f57373ba724f297db6ba");
          return { mediaid: mediaId };
        } catch (err) {
          logging.error("Failed upload a file");
          logging.error(err);
          res.header("X-CSE356", "61f9f57373ba724f297db6ba");
          return ERROR_MESSAGE("Error while creating Image Object");
        }
      } else {
        logging.error("File is not PNG or JPEG");
        logging.error(
          `Server got fileName = ${file.originalname} mimeType = ${file.mimetype}`
        );
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE("File is not PNG or JPEG");
      }
    }
  );
  fastify.get("/access/:mediaID", async (req, res) => {
    try {
      logging.info("[/access/:mediaID] Route");
      const mediaID = req.params.mediaID;
      const image = await Images.findById(mediaID);
      const { redis } = fastify;
      await redis.setex(mediaID, 3600, image.file);

      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return res.sendFile(image.file);
    } catch (err) {
      logging.error(`Error while sending image: ${mediaID}`);
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("Error while sending image");
    }
  });
};
