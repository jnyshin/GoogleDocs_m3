import {
  ELASTIC_INDEX,
  searchStringify,
  SHARE_DB_NAME,
  suggestStringify,
} from "../store.js";
import logging from "../logging.js";
import { connection, ESclient } from "../app.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";

if (process.env.instance_var === "8") {
  setInterval(async function () {
    try {
      const start = performance.now();
      connection.createFetchQuery(
        SHARE_DB_NAME,
        {},
        {},
        async (err, results) => {
          const ret = [];
          results.map((doc) => {
            const ops = doc.data.ops;
            const body = new QuillDeltaToHtmlConverter(ops, {})
              .convert()
              .replaceAll(/<[\w]*>/gi, "")
              .replaceAll(/<\/[\w]*>/gi, "")
              .replaceAll(/<[\w]*\/>/gi, "");
            ret.push({ docid: doc.id, suggest_body: body, search_body: body });
          });
          if (!ret.length) {
            return;
          }
          const operations = ret.flatMap((doc) => [
            { update: { _id: doc.docid, _index: ELASTIC_INDEX } },
            {
              doc: doc,
            },
          ]);
          await ESclient.bulk({
            index: ELASTIC_INDEX,
            refresh: true,
            operations,
          });
          const duration = performance.now() - start;
          logging.info(`Updaing elastic search took ${duration}ms`);
        }
      );
    } catch (err) {
      logging.error("Error while updating");
      logging.error(err);
    }
  }, 5000);
}

export default async (fastify, opts) => {
  fastify.get("/info", async (req, res) => {
    const response = await ESclient.info();
    return response;
  });
  fastify.get(`/search`, async (req, res) => {
    const { q } = req.query;
    const { redis } = fastify;
    const start = performance.now();
    const cache = await redis.get(q);
    if (cache) {
      logging.info("search cache hit");
      //logging.info(cache);
      return JSON.parse(cache);
    } else {
      const result = await ESclient.search({
        index: ELASTIC_INDEX,
        body: {
          query: {
            match_phrase: {
              search_mix: q,
            },
          },
        },
        highlight: {
          fragment_size: 100,
          fields: {
            search_mix: { type: "fvh" },
          },
        },
      });
      //console.log("CHECK SEARCHERROR: ", result);
      const retlist = [];
      result.hits.hits.map((r) => {
        // let s = r.highlight.search_body
        //   ? r.highlight.search_body[0]
        //   : r.highlight.search_name[0];
        let arranged = {
          docid: r._source.docid,
          name: r._source.search_name,
          snippet: r.highlight.search_mix[0],
        };
        retlist.push(arranged);
      });
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      const duration = performance.now() - start;
      logging.info(`Search took ${duration}ms`);
      logging.info(`Result searching keyword = ${q}`);
      logging.info(retlist);
      redis.setex(q, 3600, searchStringify(retlist));
      return retlist;
    }
  });

  fastify.get(`/suggest`, async (req, res) => {
    const { q } = req.query;
    const start = performance.now();
    const { redis } = fastify;
    const cache = await redis.get(q);
    if (cache) {
      logging.info("search cache hit");
      //logging.info(cache);
      const duration = performance.now() - start;
      //logging.info(`Suggestion took ${duration}ms`);
      return JSON.parse(cache);
    }
    const result = await ESclient.search({
      index: "ss_index",
      query: {
        match: {
          suggest_mix: q,
        },
      },
      highlight: {
        fragment_size: 50,
        fields: {
          suggest_mix: {},
        },
      },
    });
    const retlist = [];
    let regexp = /<em>([\d\w]+)<\/em>/;
    result.hits.hits.map((r) => {
      //   let sugg = r.highlight.suggest_body
      //     ? r.highlight.suggest_body[0].match(regexp)
      //     : r.highlight.suggest_name[0].match(regexp);
      let sugg = r.highlight.suggest_mix[0].match(regexp);
      retlist.push(sugg[1].toLowerCase());
    });
    let remdup = [...new Set(retlist)];
    const rmshorter = remdup.filter((word) => word.length > q.length);
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    logging.info(`Result Suggestions for keyword = ${q}`);
    logging.info(retlist);
    const duration = performance.now() - start;
    logging.info(`Suggestion took ${duration}ms`);
    if (retlist.length) {
      redis.setex(q, 3600, searchStringify(retlist));
    }
    return rmshorter;
  });
};
