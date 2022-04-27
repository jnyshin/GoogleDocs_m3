import { Client } from "@elastic/elasticsearch";
import IORedis from "ioredis";
import url from "url";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import { quotes, updateQuotes } from "../dataset.js";
import { connection } from "../app.js";
import { ERROR_MESSAGE } from "../store.js";
import Docs from "../schema/docs.js";
import { fetchAllDocs, fetchUpdateDocs } from "../store.js";
import logging from "../logging.js";
import { resourceLimits } from "worker_threads";
import { text } from "express";

const ESclient = new Client({
  cloud: {
    id: "ES_m3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDMyOWUxMWRiODdjZTRhM2Q5MTE0MjcwZDhiMmEzYmVjJDEyNDY5ZWFhNjVlZjQ5ODBhY2U2YzRmNGI3NjZlNzVj",
  },
  auth: {
    username: "elastic",
    password: "GoitLPz9EOuuNiybaMBM6x47",
  },
});
var freshData = [];
setInterval(async function () {
  freshData = await makeData(await fetchAllDocs());
  console.log("Fresh data updated");
}, 5000);

const makeData = async (docs) => {
  const newest = docs;
  const retlist = [];
  newest.map((n) => {
    console.log(n);
    const ops = n.data.ops;
    const converter = new QuillDeltaToHtmlConverter(ops, {});
    const html = converter.convert();
    let dum = html.replace(/(<([^>]+)>)/gi, "");
    let d = { name: n.name, body: dum, id: n.id };
    retlist.push(d);
  });
  return retlist;
};

const setIndex = async (index) => {
  //   let docs = await fetchAllDocs();
  //   const newest = await makeData(docs);
  await ESclient.deleteByQuery({
    index: index,
    body: {
      query: {
        match_all: {},
      },
    },
  });
  const operations = freshData.flatMap((doc) => [
    { index: { _index: index, _id: doc.id } },
    doc,
  ]);
  const bulkResponse = await ESclient.bulk({ refresh: true, operations });
  console.log(bulkResponse);
};
const updateIndex = async (index) => {
  //let docs = await fetchUpdateDocs();
  //   let docs = await fetchAllDocs();
  //   const updatedDocs = await makeData(docs);
  const operations = freshData.flatMap((doc) => [
    { update: { _id: doc.id, _index: index } },
    { doc: { name: doc.name, body: doc.body } },
  ]);
  const bulkResponse = await ESclient.bulk({ refresh: true, operations });
  console.log(bulkResponse);
};

export default async (fastify, opts) => {
  //get info of our elasticsearch cloud
  fastify.get("/info", async (req, res) => {
    const response = await ESclient.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    const count = await ESclient.count({ index: "search_index" });
    if (count < 1) {
      await setIndex("search_index");
    } else {
      await updateIndex("search_index");
    }
    const keyword = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "search_index", //CHANGE test3 -> search_index
      body: {
        query: {
          multi_match: {
            query: keyword,
            fields: ["name", "body"],
          },
        },
      },
      highlight: {
        fragment_size: 100,
        number_of_fragments: 1,
        fields: {
          name: {},
          body: {},
        },
      },
    });
    console.log(result.hits.hits);
    const retlist = [];
    result.hits.hits.map((r) => {
      let arranged = {
        docid: r._source.id,
        name: r._source.name,
        snippet: r.highlight.body ? r.highlight.body[0] : r.highlight.name[0],
      };
      retlist.push(arranged);
    });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return retlist;
  });

  fastify.get(`/suggest`, async (req, res) => {
    const count = await ESclient.count({ index: "suggest_index" });
    if (count < 1) {
      await setIndex("suggest_index");
    } else {
      await updateIndex("suggest_index");
    }
    const prefix = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "suggest_index", //CHANGE test2 => suggest_index
      body: {
        query: {
          multi_match: {
            query: prefix,
            fields: ["name", "body"],
          },
        },
      },
      highlight: {
        fragment_size: 100,
        number_of_fragments: 1,
        fields: {
          name: {},
          body: {},
        },
      },
    });
    const retlist = [];
    let regexp = /<em>([\d\w]+)<\/em>/;
    result.hits.hits.map((r) => {
      let sugg = r.highlight.body
        ? r.highlight.body[0].match(regexp)
        : r.highlight.name[0].match(regexp);
      console.log(sugg[1]);
      retlist.push(sugg[1].toLowerCase());
    });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    let remdup = [...new Set(retlist)];
    return { remdup };
  });
};
