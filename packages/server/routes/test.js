import { ELASTIC_INDEX, updateAllDocs } from "../store.js";
import { ESclient } from "../app.js";
export default async (fastify, opts) => {
  fastify.get(`/performace`, async (req, res) => {
    const performanceCheck = await performaceSensitiveFunc();
    return { took: `${performanceCheck}ms` };
  });

  fastify.get(`/update`, async (req, res) => {
    const id = "test";
    ESclient.update({
      index: ELASTIC_INDEX,
      id: id,
      doc: {
        body: "hello world",
      },
    });
    return {};
  });

  fastify.get(`/index`, async (req, res) => {
    const id = "test";
    const name = "this is a test";
    ESclient.index({
      index: ELASTIC_INDEX,
      id: id,
      document: {
        docid: id,
        suggest_name: name,
        search_name: name,
        suggest_body: "",
        search_body: "",
      },
    });

    return {};
  });

  fastify.get(`/sample`, async (req, res) => {
    updateAllDocs();
    // await ESclient.indices.refresh({ index: "search_index" });
    return {};
  });
};

async function performaceSensitiveFunc() {
  const start = performance.now();
  await updateAllDocs();
  const duration = performance.now() - start;
  return duration;
}
