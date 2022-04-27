import logging from "../logging.js";
import Docs from "../../server/schema/docs.js";
import { fetchDoc } from "../../server/store.js";
import IORedis from "ioredis";
const pub = new IORedis();
export default async (fastify, opts) => {
  fastify.post("/op/:DOCID/:UID", async (req, res) => {
    const id = req.params.UID;
    logging.info("[/doc/op/:DOCID/:UID] Route", id);
    const docId = req.params.DOCID;
    const version = req.body.version;
    const op = req.body.op;
    const { redis } = fastify;

    try {
      const document = await fetchDoc(docId);
      if (version !== document.version) {
        logging.info(
          `Version is not matched. client = ${version}, server=${document.version}.`,
          id
        );
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        logging.info("{ status: retry }", id);
        return { status: "retry" };
      } else if (document.preventCompose) {
        logging.info("Someone is currently editing");
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        logging.info("{ status: retry }", id);
        return { status: "retry" };
      } else {
        document.preventCompose = true;
        const ack = await docSubmitOp(document, op, id);
        const clients = await redis.lrange("clients", 0, -1);
        await Docs.findByIdAndUpdate(docId, {
          $inc: { version: 1 },
        });
        clients.map((c) => {
          const client = JSON.parse(c);
          if (client.id === id) {
            pub.publish(client.id, ackStringify(ack));
          }
          if (client.id !== id && client.docId === docId) {
            pub.publish(client.id, opStringify(op));
          }
        });
        logging.info("{ status: ok }", id);
        document.preventCompose = false;
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return { status: "ok" };
      }
    } catch (err) {
      logging.error("failed to update OP", id);
      logging.error(err);
      return ERROR_MESSAGE("failed to update OP");
    }
  });
};
