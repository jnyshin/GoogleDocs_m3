export default async (fastify, opts) => {
  fastify.get(`/123`, async (req, res) => {
    return { hello };
  });
  fastify.post(`/pub`, async (req, res) => {
    return {};
  });
};
