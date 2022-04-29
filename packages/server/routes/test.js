import { fetchAllDocs } from "../store.js";
import { ESclient } from "../app.js";
export default async (fastify, opts) => {
  fastify.get(`/`, async (req, res) => {
    const performanceCheck = await performaceSensitiveFunc();
    return { took: `${performanceCheck}ms` };
  });
  fastify.post(`/updateIndex`, async (req, res) => {
    const id = "test";
    const name = "this is a test";
    ESclient.index({
      index: "search_index",
      id: id,
      document: {
        docid: id,
        name: name,
        body: "",
      },
    });
    // await ESclient.indices.refresh({ index: "search_index" });
    return {};
  });
};

async function performaceSensitiveFunc() {
  const start = performance.now();
  await fetchAllDocs();
  const duration = performance.now() - start;
  return duration;
}
