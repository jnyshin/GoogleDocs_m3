import { ELASTIC_INDEX, SHARE_DB_NAME } from "../store.js";
import {
  // connection,
  ESclient,
} from "../app.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import logging from "../logging.js";
export default async (fastify, opts) => {
  fastify.get(`/performance`, async (req, res) => {
    const performanceCheck = await performaceSensitiveFunc();
    return { took: `${performanceCheck}ms` };
  });

  fastify.get(`/update`, async (req, res) => {
    try {
      const result = await ESclient.search({
        index: ELASTIC_INDEX,
        query: {
          match_all: {},
        },
      });
      console.log(result.hits);
    } catch (err) {
      logging.error(err);
    }
    logging.info("HERE");
    return {};
  });

  fastify.get(`/index`, async (req, res) => {
    const query = connection.createFetchQuery(
      SHARE_DB_NAME,
      {},
      {},
      async (err, results) => {
        const ret = [];
        query.results.map((doc) => {
          const ops = doc.data.ops;
          const body = new QuillDeltaToHtmlConverter(ops, {})
            .convert()
            .replaceAll(/<[\w]*>/gi, "")
            .replaceAll(/<\/[\w]*>/gi, "")
            .replaceAll(/<[\w]*\/>/gi, "");
          ret.push({ docid: doc.id, suggest_body: body, search_body: body });
        });
        const operations = ret.flatMap((doc) => [
          { update: { _id: doc.docid, _index: ELASTIC_INDEX } },
          {
            doc: doc,
          },
        ]);
        console.log(operations);
        await ESclient.bulk({
          index: ELASTIC_INDEX,
          operations,
        });
      }
    );

    return {};
  });

  fastify.get(`/sample`, async (req, res) => {
    return {};
  });
};

async function performaceSensitiveFunc() {
  const start = performance.now();
  const duration = performance.now() - start;
  return duration;
}
