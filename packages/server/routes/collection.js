import express from "express";
import Docs from "../schema/docs";
import { v4 as uuidv4 } from "uuid";
import logging from "../logging";
import { ERROR_MESSAGE } from "../store";

const router = express.Router();

router.post("/create", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/collection/create] Route");
    const name = req.body.name;
    const id = uuidv4();
    try {
      logging.info(`created new doc id=${id} route`);
      await Docs.create({
        _id: id,
        id: id,
        name: name,
        data: { ops: [{ insert: "" }] },
        version: 0,
      });
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(id);
    } catch (err) {
      logging.error(`failed to created doc with id = ${id}`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE(`failed to created doc with id = ${id}`));
    }
  }
});

router.post("/delete", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/collection/delete] Route");
    const docId = req.body.docid;
    try {
      await Docs.findByIdAndDelete(docId);
      logging.info(`deleted doc id=${docId} route`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send();
    } catch (err) {
      logging.error(`failed to delete doc id = ${docId}`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE(`failed to delete doc id = ${docId}`));
    }
  }
});
router.get("/list", async (req, res) => {
  if (!req.session.user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  } else {
    logging.info("[/collection/list] Route");
    try {
      const docs = await Docs.find().sort({ updatedAt: -1 }).limit(10);
      const ret = [];
      for (const doc of docs) {
        const ele = {
          id: doc.id,
          name: doc.name,
        };
        ret.push(ele);
      }
      logging.info(`sent docs list`);
      logging.info(ret);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ret);
    } catch (err) {
      logging.error("failed find all docs");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("failed find all docs"));
    }
  }
});
export default router;
