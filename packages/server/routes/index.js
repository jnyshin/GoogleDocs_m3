import { Client, Serializer } from "@elastic/elasticsearch";

import { fetchAllDocs, elasticStringify, searchStringify } from "../store.js";
import logging from "../logging.js";
class MySerializer extends Serializer {
  serialize(obj) {
    return elasticStringify(obj);
  }
}
const clientOptions =
  process.env.NODE_ENV === "production"
    ? { node: "http://localhost:9200", Serializer: MySerializer }
    : {
        cloud: {
          id: "My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNkOWI2NmViOTVkMTQ3MmI5YmFhYjQ4NGFhNDhkMmZjJDcwZDk2ZGFiMTJjYjQyZmFiOGJiMTU2NmJkMWM1MGQw",
        },
        auth: {
          username: "elastic",
          password: "gzq9AcKIBr3BKi7UXuvuutHr",
        },
        Serializer: MySerializer,
      };

const ESclient = new Client(clientOptions);

let rmopen = /<[\w]*>/gi;
let rmclose = /<\/[\w]*>/gi;

//call resetIndex(research_index) to reset it!!
export const resetIndex = async (index) => {
  logging.info("resetIndex Reached");
  await ESclient.deleteByQuery({
    index: index,
    body: {
      query: {
        match_all: {},
      },
    },
  });
};

const setIndex = async (index, freshData) => {
  const operations = freshData.flatMap((doc) => [
    { index: { _id: doc.id } },
    doc,
  ]);
  const upload = await ESclient.bulk({
    refresh: true,
    index: index,
    operations,
  });
  logging.error(upload.errors);
};

export default async (fastify, opts) => {
  fastify.get("/info", async (req, res) => {
    const response = await ESclient.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    const { q } = req.query;
    const { redis } = fastify;
    const cache = await redis.get(q);
    if (cache) {
      logging.info("search cache hit");
      logging.info(cache);
      return JSON.parse(cache);
    } else {
      const freshData = await fetchAllDocs();
      await setIndex("search_index", freshData);
      var re = new RegExp(q, "g");
      const result = await ESclient.search({
        index: "search_index",
        body: {
          query: {
            dis_max: {
              queries: [
                { match_phrase: { body: q } },
                { match_phrase: { name: q } },
              ],
            },
          },
        },
        highlight: {
          fragment_size: 100,
          fields: {
            body: { fragmenter: "span", type: "fvh" },
            name: { fragmenter: "span", type: "fvh" },
          },
        },
      });
      const retlist = [];
      result.hits.hits.map((r) => {
        let s = r.highlight.body ? r.highlight.body[0] : r.highlight.name[0];
        let arranged = {
          docid: r._source.id,
          name: r._source.name,
          // snippet: s
          //   .replaceAll(rmopen, "")
          //   .replaceAll(rmclose, "")
          //   .replaceAll(re, "<em>" + keyword + "</em>"),
          snippet: s,
        };
        retlist.push(arranged);
      });
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      logging.info(`Result searching keyword = ${q}`);
      logging.info(retlist);
      redis.setex(q, 3600, searchStringify(retlist));
      return retlist;
    }
  });

  fastify.get(`/suggest`, async (req, res) => {
    let freshData = await fetchAllDocs();
    await setIndex("suggest_index", freshData);
    const { q } = req.query;
    const result = await ESclient.search({
      index: "suggest_index",
      query: {
        multi_match: {
          query: q,
          fields: ["body", "name"],
        },
      },
      highlight: {
        fragment_size: 50,
        fields: {
          body: {},
          name: {},
        },
      },
    });
    const retlist = [];
    let regexp = /<em>([\d\w]+)<\/em>/;
    result.hits.hits.map((r) => {
      let sugg = r.highlight.body
        ? r.highlight.body[0].match(regexp)
        : r.highlight.name[0].match(regexp);
      retlist.push(sugg[1].toLowerCase());
    });
    let remdup = [...new Set(retlist)];
    const rmshorter = remdup.filter((word) => word.length > q.length);
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    logging.info(`Result Suggestions for keyword = ${q}`);
    logging.info(retlist);
    return rmshorter;
  });
};
