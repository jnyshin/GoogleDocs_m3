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
import { resourceLimits } from "worker_threads";

const ESclient = new Client({
  cloud: {
    id: "ES_m3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDMyOWUxMWRiODdjZTRhM2Q5MTE0MjcwZDhiMmEzYmVjJDEyNDY5ZWFhNjVlZjQ5ODBhY2U2YzRmNGI3NjZlNzVj",
  },
  auth: {
    username: "elastic",
    password: "GoitLPz9EOuuNiybaMBM6x47",
  },
}); //More configuration will be added after ES Cloud set up

export default async (fastify, opts) => {
  fastify.get("/info", async (req, res) => {
    const response = await client.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    const keyword = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "m3",
      query: {
        match: {
          title: keyword,
          body: keyword,
        },
      },
    });
    console.log(result.hits.hits);
    return result.hits.hits; //may need to arrange formats
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
    const result = await ESclient.search({
      index: "m3",
      suggest: {
        gotsuggest: {
          text: keyword,
          term: { field: "body" },
        },
      },
    });
    console.log(result);
    return result;
  });
};
