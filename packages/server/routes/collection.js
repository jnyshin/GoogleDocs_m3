import Docs from "../schema/docs.js";
import { v4 as uuidv4 } from "uuid";
import logging from "../logging.js";
import { ERROR_MESSAGE } from "../store.js";
import { connection } from "../app.js";
export default async (fastify, opts) => {
  fastify.post("/create", async (req, res) => {
    logging.info("[/collection/create] Route");
    const name = req.body.name;
    const id = uuidv4();
    try {
      logging.info(`created new doc id=${id} route`);
      const share_doc = connection.get("share_docs", id);
      share_doc.create([], "rich-text");
      share_doc.preventCompose = true;
      await Docs.create({
        _id: id,
        id: id,
        name: name,
      });
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return { docid: id };
    } catch (err) {
      logging.error(`failed to created doc with id = ${id}`);
      logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(`failed to created doc with id = ${id}`);
    }
  });

  fastify.post("/delete", async (req, res) => {
    logging.info("[/collection/delete] Route");
    const docId = req.body.docid;
    try {
      await Docs.findByIdAndDelete(docId);
      logging.info(`deleted doc id=${docId} route`);
      const share_doc = connection.get("share_docs", docId);
      share_doc.del();
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return {};
    } catch (err) {
      logging.error(`failed to delete doc id = ${docId}`);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(`failed to delete doc id = ${docId}`);
    }
  });
  fastify.get("/list", async (req, res) => {
    logging.info("[/collection/list] Route");
    try {
      const query = connection.createFetchQuery("share_docs", {
        $sort: { "_m.mtime": -1 },
        $limit: 10,
      });
      const ret = [];
      query.on("ready", async () => {
        query.results.map(async (doc) => {
          console.log(doc.id);
          const document = await Docs.findById(doc.id);
          console.log(document);
          ret.push({ id: document.id, name: document.name });
        });
        logging.info(`sent docs list`);
        logging.info(ret);
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ret;
      });
    } catch (err) {
      logging.error("failed find all docs");
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("failed find all docs");
    }
  });
};
