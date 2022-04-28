import { Client, Serializer } from "@elastic/elasticsearch";
import url from "url";
import { fetchAllDocs, elasticStringify } from "../store.js";
import logging from "../logging.js";
class MySerializer extends Serializer {
  serialize(obj) {
    return elasticStringify(obj);
  }
}
const ESclient = new Client({
  cloud: {
    id: "ES_m3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDMyOWUxMWRiODdjZTRhM2Q5MTE0MjcwZDhiMmEzYmVjJDEyNDY5ZWFhNjVlZjQ5ODBhY2U2YzRmNGI3NjZlNzVj",
  },
  auth: {
    username: "elastic",
    password: "GoitLPz9EOuuNiybaMBM6x47",
  },
  Serializer: MySerializer,
});
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
    let freshData = await fetchAllDocs();
    await setIndex("search_index", freshData);
    const { q } = req.query;
    const keyword = url.parse(req.url, true).query.q;
    var re = new RegExp(keyword, "g");
    const result = await ESclient.search({
      index: "search_index",
      body: {
        query: {
          dis_max: {
            queries: [
              { match_phrase: { body: keyword } },
              { match_phrase: { name: keyword } },
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
    return retlist;
  });

  fastify.get(`/suggest`, async (req, res) => {
    let freshData = await fetchAllDocs();
    await setIndex("suggest_index", freshData);
    const prefix = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "suggest_index",
      body: {
        query: {
          multi_match: {
            query: prefix,
            fields: ["body", "name"],
          },
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
    const rmshorter = remdup.filter((word) => word.length > prefix.length);
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    logging.info(`Result Suggestions for keyword = ${prefix}`);
    logging.info(retlist);
    return rmshorter;
  });
};
