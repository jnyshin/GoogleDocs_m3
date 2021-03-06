import Docs from "../schema/docs.js";
import { v4 as uuidv4 } from "uuid";
import logging from "../logging.js";
import {
  ERROR_MESSAGE,
  fetchCreateDocs,
  fetchDoc,
  ELASTIC_INDEX,
} from "../store.js";
import { ESclient } from "../app.js";
export default async (fastify, opts) => {
  fastify.post("/create", async (req, res) => {
    const name = req.body.name;
    const id = uuidv4();
    try {
      //logging.info(`created new doc id=${id} route`);
      await fetchCreateDocs(id);
      await Docs.create({
        _id: id,
        id: id,
        name: name,
        version: 1,
      });
      ESclient.index({
        index: ELASTIC_INDEX,
        id: id,
        document: {
          docid: id,
          suggest_name: name,
          search_name: name,
          suggest_mix: "",
          search_mix: "",
        },
      });
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return { docid: id };
    } catch (err) {
      //logging.error(`failed to created doc with id = ${id}`);
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(`failed to created doc with id = ${id}`);
    }
  });

  fastify.post("/delete", async (req, res) => {
    const docId = req.body.docid;
    try {
      await Docs.findByIdAndDelete(docId);
      const document = await fetchDoc(docId);
      document.del();
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return {};
    } catch (err) {
      //logging.error(`failed to delete doc id = ${docId}`);
      //logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(`failed to delete doc id = ${docId}`);
    }
  });
  fastify.get("/list", async (req, res) => {
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
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ret;
    } catch (err) {
      //logging.error("failed find all docs");
      //logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("failed find all docs");
    }
  });
};
