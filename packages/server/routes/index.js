import { Client } from "@elastic/elasticsearch";
const myCache = new NodeCache();
import IORedis from "ioredis";
import url from "url";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import NodeCache from "node-cache";
import { connection } from "../app.js";
import { ERROR_MESSAGE } from "../store.js";
import Docs from "../schema/docs.js";
import logging from "../logging.js";

// const ESclient = new Client({
//   node: "http://localhost:9200",
// }); //More configuration will be added after ES Cloud set up

export default async (fastify, opts) => {
  fastify.get(`/search`, async (req, res) => {
    const keyword = url.parse(req.url, true).query.q;
    return keyword;
    // const query = connection.createSubscribeQuery("share_docs", {
    //   $sort: { "_m.mtime": -1 },
    //   $limit: 10,
    // });
    // const ret = [];
    // query.on("ready", () => {
    //   query.results.map(async (doc) => {
    //     // console.log(doc.id);
    //     const document = await Docs.findById(doc.id);
    //     ret.push({ id: document.id, name: document.name });
    //   });
    // });
    // return {};
  });
  fastify.get(`/suggest`, async (req, res) => {
    const keyword = url.parse(req.url, true).query.q;
    return keyword;
  });
};
