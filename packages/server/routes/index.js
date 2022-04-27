import { Client } from "@elastic/elasticsearch";
import IORedis from "ioredis";
import url from "url";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import { quotes } from "../dataset.js";
import { connection } from "../app.js";
import { ERROR_MESSAGE } from "../store.js";
import Docs from "../schema/docs.js";
import { fetchAllDocs } from "../store.js";
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

const makeData = () => {
  const newest = fetchAllDocs();
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

const updateIndex = async (index) => {
  //const newest = makeData();
  //console.log(newest);
  //clear all existing document
  await ESclient.deleteByQuery({
    index: index,
    body: {
      query: {
        match_all: {},
      },
    },
  });
  const operations = quotes.flatMap((doc) => [
    //CHANGE quotes -> newest
    { index: { _index: index } },
    doc,
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
    await updateIndex("test3");
    const keyword = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "test3", //CHANGE test3 -> search_index
      body: {
        query: {
          multi_match: {
            query: keyword,
            fields: ["quote", "author"],
          },
        },
      },
      highlight: {
        fragment_size: 100,
        number_of_fragments: 1,
        fields: {
          quote: {},
          author: {},
        },
      },
    });
    console.log(result.hits.hits);
    const retlist = [];
    result.hits.hits.map((r) => {
      let arranged = {
        docid: r._source.id,
        name: r._source.author,
        snippet: r.highlight.quote
          ? r.highlight.quote[0]
          : r.highlight.author[0],
      };
      retlist.push(arranged);
    });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return retlist;
  });

  fastify.get(`/suggest`, async (req, res) => {
    await updateIndex("test2");
    const prefix = url.parse(req.url, true).query.q;
    const result = await ESclient.search({
      index: "test2", //CHANGE test2 => suggest_index
      body: {
        query: {
          multi_match: {
            query: prefix,
            fields: ["quote", "author"],
          },
        },
      },
      highlight: {
        fragment_size: 100,
        number_of_fragments: 1,
        fields: {
          quote: {},
          author: {},
        },
      },
    });
    const retlist = [];
    let regexp = /<em>([\d\w]+)<\/em>/;
    result.hits.hits.map((r) => {
      let sugg = r.highlight.quote
        ? r.highlight.quote[0].match(regexp)
        : r.highlight.author[0].match(regexp);
      console.log(sugg[1]);
      retlist.push(sugg[1].toLowerCase());
    });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return { retlist };
  });
};
