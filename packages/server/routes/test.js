const myCache = new NodeCache();
import IORedis from "ioredis";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import NodeCache from "node-cache";
import { connection } from "../app.js";
import { ERROR_MESSAGE } from "../store.js";
import Docs from "../schema/docs.js";

export default async (fastify, opts) => {
  fastify.get(`/`, async (req, res) => {
    const query = connection.createSubscribeQuery("share_docs", {
      $sort: { "_m.mtime": -1 },
      $limit: 10,
    });
    const ret = [];
    query.on("ready", () => {
      query.results.map(async (doc) => {
        // console.log(doc.id);
        const document = await Docs.findById(doc.id);
        ret.push({ id: document.id, name: document.name });
      });
    });
    return {};
  });
  fastify.get(`/pub`, async (req, res) => {
    const { redis } = fastify;
    const newDoc = connect.get("docs", "eff61d5b-6065-4f38-a8fb-3ba9c105105a");
    console.log(newDoc.preventCompose);
    return {};
  });
};
