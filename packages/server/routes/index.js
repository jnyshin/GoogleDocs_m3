import { Serializer } from "@elastic/elasticsearch";
import { fetchAllDocs, elasticStringify, searchStringify } from "../store.js";
import logging from "../logging.js";
import { ESclient } from "../app.js";
class MySerializer extends Serializer {
  serialize(obj) {
    return elasticStringify(obj);
  }
}

var freshData = [];
setInterval(async function () {
  try {
    freshData = await fetchAllDocs();
    await setIndex("search_index");
    await setIndex("suggest_index");
    console.log("Fresh data updated");
  } catch {
    logging.warn("No income data yet");
  }
}, 5000);

const setIndex = async (index) => {
  console.log("setIndex reached");
  console.log(freshData);
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
      //   const freshData = await fetchAllDocs();
      //   await setIndex("search_index", freshData);
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
      console.log("CHECK SEARCHERROR: ", result);
      const retlist = [];
      result.hits.hits.map((r) => {
        let s = r.highlight.body ? r.highlight.body[0] : r.highlight.name[0];
        let arranged = {
          docid: r._source.id,
          name: r._source.name,
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
    // let freshData = await fetchAllDocs();
    // await setIndex("suggest_index", freshData);
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
