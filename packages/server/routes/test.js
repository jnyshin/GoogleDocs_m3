import { fetchAllDocs } from "../store.js";

export default async (fastify, opts) => {
  fastify.get(`/`, async (req, res) => {
    const performanceCheck = await performaceSensitiveFunc();
    return { took: `${performanceCheck}ms` };
  });
  fastify.post(`/pub`, async (req, res) => {
    return {};
  });
};

async function performaceSensitiveFunc() {
  const start = performance.now();
  await fetchAllDocs();
  const duration = performance.now() - start;
  return duration;
}
