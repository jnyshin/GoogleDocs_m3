import express from "express";
import Docs from "../schema/docs";
import { v4 as uuidv4 } from "uuid";
import logging from "../logging";

const router = express.Router();

router.post("/create", async (req, res) => {
  logging.info("/collection/create route");
  const name = req.body.name;
  const id = uuidv4();
  await Docs.create({
    _id: id,
    id: id,
    name: name,
    data: { ops: [{ insert: "" }] },
  });
  logging.info(`created new doc id=${id} route`);
  res.send(id);
});

router.post("/delete", async (req, res) => {
  logging.info("/collection/delete route");
  const docId = req.body.docid;
  await Docs.findByIdAndDelete(docId);
  logging.info(`deleted doc id=${docId} route`);
  res.send();
});
router.get("/list", async (req, res) => {
  logging.info("/collection/list route");
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
  res.send(ret);
});
export default router;
