import { fetchAllDocs } from "../store";

export default async (fastify, opts) => {
  fastify.get(`/`, async (req, res) => {
    const performanceCheck = performaceSensitiveFunc();
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
