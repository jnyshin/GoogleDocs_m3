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
      console.log(result);
    } catch (err) {
      logging.error(err);
    }
    logging.info("HERE");
    return {};
  });

  fastify.get(`/index`, async (req, res) => {
    ESclient.index({
      index: ELASTIC_INDEX,
      id: "1",
      document: {
        docid: "1",
        suggest_name: "hasung",
        search_name: "hasung",
        suggest_body: "",
        search_body: "",
      },
    });

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
