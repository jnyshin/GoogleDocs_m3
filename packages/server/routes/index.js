import { ELASTIC_INDEX, searchStringify, updateAllDocs } from "../store.js";
import logging from "../logging.js";
import { ESclient } from "../app.js";

var freshData = [];
setInterval(async function () {
  try {
    await updateAllDocs();

    logging.info("updated elastic search docs!!");
  } catch (err) {
    logging.error("Error while updating");
    logging.error(err);
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
      const result = await ESclient.search({
        index: ELASTIC_INDEX,
        body: {
          query: {
            dis_max: {
              queries: [
                { match_phrase: { search_body: q } },
                { match_phrase: { search_name: q } },
              ],
            },
          },
        },
        highlight: {
          fragment_size: 100,
          fields: {
            search_body: { fragmenter: "span", type: "fvh" },
            search_name: { fragmenter: "span", type: "fvh" },
          },
        },
      });
      //console.log("CHECK SEARCHERROR: ", result);
      const retlist = [];
      result.hits.hits.map((r) => {
        let s = r.highlight.search_body
          ? r.highlight.search_body[0]
          : r.highlight.search_name[0];
        let arranged = {
          docid: r._source.id,
          name: r._source.search_name,
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
    const { q } = req.query;
    const result = await ESclient.search({
      index: "ss_index",
      query: {
        multi_match: {
          query: q,
          fields: ["suggest_body", "suggest_name"],
        },
      },
      highlight: {
        fragment_size: 50,
        fields: {
          suggest_body: {},
          suggest_name: {},
        },
      },
    });
    const retlist = [];
    let regexp = /<em>([\d\w]+)<\/em>/;
    result.hits.hits.map((r) => {
      let sugg = r.highlight.suggest_body
        ? r.highlight.suggest_body[0].match(regexp)
        : r.highlight.suggest_name[0].match(regexp);
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
