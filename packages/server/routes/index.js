import {
  ELASTIC_INDEX,
  searchStringify,
  updateAllDocs,
  SHARE_DB_NAME,
} from "../store.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../logging.js";
import { connection, ESclient } from "../app.js";
// import debounce from "loadsh";
console.log("Set Interval called!");
setInterval(async () => {
  try {
    const start = performance.now();
    const promises = [];
    connection.createFetchQuery(SHARE_DB_NAME, {}, {}, (err, results) => {
      results.map(async (doc) => {
        const ops = doc.data.ops;
        const body = new QuillDeltaToHtmlConverter(ops, {})
          .convert()
          .replaceAll(/<[\w]*>/gi, "")
          .replaceAll(/<\/[\w]*>/gi, "")
          .replaceAll(/<[\w]*\/>/gi, "");

        promises.push(
          await ESclient.update({
            index: ELASTIC_INDEX,
            id: doc.id,
            doc: {
              suggest_body: body,
              search_body: body,
            },
          })
        );
      });
    });
    await Promise.all(promises);
    const duration = performance.now() - start;
    logging.info(`took ${duration}ms`);
    logging.info("updated elastic search docs");
  } catch (err) {
    logging.error(err);
  }
}, 5000);

export default async (fastify, opts) => {
  fastify.get("/info", async (req, res) => {
    try {
      const start = performance.now();
      const promises = [];
      connection.createFetchQuery(SHARE_DB_NAME, {}, {}, (err, results) => {
        results.map(async (doc) => {
          const ops = doc.data.ops;
          const body = new QuillDeltaToHtmlConverter(ops, {})
            .convert()
            .replaceAll(/<[\w]*>/gi, "")
            .replaceAll(/<\/[\w]*>/gi, "")
            .replaceAll(/<[\w]*\/>/gi, "");

          promises.push(
            await ESclient.update({
              index: ELASTIC_INDEX,
              id: doc.id,
              doc: {
                suggest_body: body,
                search_body: body,
              },
            })
          );
        });
      });
      await Promise.all(promises);
      const duration = performance.now() - start;
      logging.info(`took ${duration}ms`);
      logging.info("updated elastic search docs");
      // connection.createFetchQuery(
      //   SHARE_DB_NAME,
      //   {},
      //   {},
      //   async (err, results) => {
      //     if (err) logging.error(err);
      //     const ret = [];
      //     results.map((doc) => {
      //       const ops = doc.data.ops;
      //       const body = new QuillDeltaToHtmlConverter(ops, {})
      //         .convert()
      //         .replaceAll(/<[\w]*>/gi, "")
      //         .replaceAll(/<\/[\w]*>/gi, "")
      //         .replaceAll(/<[\w]*\/>/gi, "");

      //       ret.push({ docid: doc.id, suggest_body: body, search_body: body });
      //     });
      //     const operations = ret.flatMap((value) => [
      //       {
      //         id: value.id,
      //         doc: {
      //           suggest_body: value.suggest_body,
      //           search_body: value.search_body,
      //         },
      //       },
      //     ]);
      //     await ESclient.bulk({
      //       index: ELASTIC_INDEX,
      //       refresh: true,
      //       operations,
      //     });
      //     const duration = performance.now() - start;
      //     logging.info(`took ${duration}ms`);
      //     logging.info("updated elastic search docs");
      //   }
      // );
    } catch (err) {
      logging.error("Error while updating");
      logging.error(err);
    }
    return {};
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
          docid: r._source.docid,
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
