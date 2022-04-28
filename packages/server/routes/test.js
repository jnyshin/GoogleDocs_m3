import IORedis from "ioredis";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import { connection } from "../app.js";
import { ERROR_MESSAGE, fetchAllDocs, SHARE_DB_NAME } from "../store.js";
import Docs from "../schema/docs.js";

export default async (fastify, opts) => {
  fastify.get(`/123`, async (req, res) => {
    const test = await fetchAllDocs();
    console.log(test);
    // const share_doc = connection.get(SHARE_DB_NAME, id);
    // share_doc.create([], "rich-text");
    // console.log(id);
    return { hello };
  });
  fastify.post(`/pub`, async (req, res) => {
    const id = req.body.id;
    connection.createFetchQuery(
      SHARE_DB_NAME,
      { _id: id },
      {},
      (err, results) => {
        console.log(results[0].data.ops);
        results[0].submitOp([{ insert: "HELLO WORLD" }]);
      }
    );

    return {};
  });
};
