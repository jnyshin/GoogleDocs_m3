import { Client } from "@elastic/elasticsearch";
const myCache = new NodeCache();
import IORedis from "ioredis";
import url from "url";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import NodeCache from "node-cache";
import { quotes } from "../dataset.js";
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
    const response = await ESclient.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    const keyword = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "test",
      body: {
        query: {
          multi_match: {
            query: keyword,
            fields: ["quote", "author"],
          },
        },
      },
      highlight: {
        fragment_size: 50,
        fields: {
          quote: {},
        },
      },
    });
    console.log(result.hits.hits);
    const retlist = [];
    result.hits.hits.map((r) => {
      console.log(r);
      let arranged = {
        docid: r._source.id,
        name: r._source.quote,
        snippet: r.highlight.quote[0],
      };
      retlist.push(arranged);
    });
    return retlist; //may need to arrange formats

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
  fastify.post("/data", async (req, res) => {
    //console.log(quotes);
    const operations = quotes.flatMap((doc) => [
      { index: { _index: "test" } },
      doc,
    ]);
    const bulkResponse = await ESclient.bulk({ refresh: true, operations });
    console.log(bulkResponse);
    const count = await ESclient.count({ index: "test" });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return count;
  });
};
