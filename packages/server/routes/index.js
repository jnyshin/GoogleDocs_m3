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
let freshData = [];
setInterval(async function () {
  freshData = await fetchAllDocs();
  logging.info("Fresh data updated");
}, 5000);

const setIndex = async (index) => {
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
  ESclient.bulk({ refresh: true, operations });
};
const updateIndex = async (index) => {
  const operations = freshData.flatMap((doc) => [
    { update: { _id: doc.id, _index: index } },
    { doc: { name: doc.name, body: doc.body } },
  ]);
  ESclient.bulk({ refresh: true, operations });
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
