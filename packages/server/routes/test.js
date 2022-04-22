export default async (fastify, opts) => {
  fastify.get(`/:key`, async (req, res) => {
    const { key } = req.params;
    console.log(key);
    console.log(`from ${process.pid}`);
    console.log(req.session.authenticated);
    const { redis } = fastify;
    try {
      const value = await redis.get(key);
      redis.incr(key);
      return { value: value };
    } catch (err) {
      return err;
    }
  });
  fastify.post(`/`, async (req, res) => {
    console.log(`from ${process.pid}`);
    const { key, value } = req.body;
    const { redis } = fastify;
    try {
      await redis.set(key, value);
      return { status: "ok" };
    } catch (err) {
      return err;
    }
  });
};
