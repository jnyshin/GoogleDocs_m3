import { ELASTIC_INDEX, fetchDoc, SHARE_DB_NAME } from "../store.js";
import {
  connection,
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

  fastify.post(`/test1`, async (req, res) => {
    const docId = req.body.docId;
    const query = connection.createFetchQuery(SHARE_DB_NAME, {});
    query.on("ready", () => {
      query.results.map((val) => {
        console.log(val);
      });
    });
    return {};
  });

  fastify.post(`/test2`, async (req, res) => {
    const docId = req.body.docId;

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
