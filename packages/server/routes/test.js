export default async (fastify, opts) => {
  fastify.get("/test", async (req, res) => {
    const { redis } = fastify;
    console.log(redis);
  });
};
