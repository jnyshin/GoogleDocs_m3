import { Client } from "@elastic/elasticsearch";
import url from "url";
import { fetchAllDocs, fetchUpdateDocs } from "../store.js";
import logging from "../logging.js";

const ESclient = new Client({
  cloud: {
    id: "ES_m3:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDMyOWUxMWRiODdjZTRhM2Q5MTE0MjcwZDhiMmEzYmVjJDEyNDY5ZWFhNjVlZjQ5ODBhY2U2YzRmNGI3NjZlNzVj",
  },
  auth: {
    username: "elastic",
    password: "GoitLPz9EOuuNiybaMBM6x47",
  },
});
//let freshData = [];
// setInterval(async function () {
//   //await setIndex("search_index");
//   //await setIndex("suggest_index");
//   logging.info("Fresh data updated");
//   //console.log(freshData);
// }, 5000);
let rmopen = /<[\w]*>/gi;
let rmclose = /<\/[\w]*>/gi;
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

const updateIndex = async (index) => {
  const operations = freshData.flatMap((doc) => [
    { update: { _id: doc.id } },
    { doc: { body: doc.body } },
  ]);
  const upload = await ESclient.bulk({
    refresh: true,
    conflicts: "proceed",
    index: index,
    operations,
  });
  logging.error(upload.errors);
};

export default async (fastify, opts) => {
  //get info of our elasticsearch cloud
  fastify.get("/info", async (req, res) => {
    const response = await ESclient.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    let freshData = await fetchAllDocs();
    //const count = await ESclient.count({ index: "search_index" });
    //console.log("search_index has count ", count.count);
    console.log(freshData);
    await setIndex("search_index", freshData);
    // if (count.count < 1) {
    //   await setIndex("search_index");
    // } else {
    //   await updateIndex("search_index");
    // }
    const { q } = req.query;
    const keyword = url.parse(req.url, true).query.q;
    var re = new RegExp(keyword, "g");
    const result = await ESclient.search({
      index: "search_index", //CHANGE test3 -> search_index
      body: {
        query: {
          dis_max: {
            queries: [
              { match_phrase: { name: keyword } },
              { match_phrase: { body: keyword } },
            ],
          },
        },
      },
      highlight: {
        fragment_size: 100,
        fields: {
          name: {},
          body: {},
        },
      },
    });
    console.log(result);
    const retlist = [];
    result.hits.hits.map((r) => {
      let s = r.highlight.body ? r.highlight.body[0] : r.highlight.name[0];
      let arranged = {
        docid: r._source.id,
        name: r._source.name,
        snippet: s
          .replaceAll(rmopen, "")
          .replaceAll(rmclose, "")
          .replaceAll(re, "<em>" + keyword + "</em>"),
      };
      retlist.push(arranged);
    });
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return retlist;
  });

  fastify.get(`/suggest`, async (req, res) => {
    // const count = await ESclient.count({ index: "suggest_index" });
    // if (count.count < 1) {
    //   await setIndex("suggest_index");
    // } else {
    //   await updateIndex("suggest_index");
    // }
    let freshData = await fetchAllDocs();

    await setIndex("suggest_index", freshData);
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
      //console.log(sugg[1]);
      retlist.push(sugg[1].toLowerCase());
    });
    console.log(result.hits.hits);
    let remdup = [...new Set(retlist)];
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return remdup;
  });
};
