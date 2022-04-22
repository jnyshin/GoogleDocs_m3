export default async (fastify, opts) => {
  fastify.get(`/:key`, async (req, res) => {
    const { key } = req.params;
    console.log(key);
    console.log(`from ${process.pid}`);
    console.log(req.session.authenticated);
    const { redis } = fastify;
    try {
      //const value = await redis.get(key);
      const clients = await redis.lrange("clients", 0, -1);
      console.log(clients);
      await redis.lpush("clients", "Mike");
      //redis.incr(key);
      return redis.lrange("clients", 0, -1);
    } catch (err) {
      return err;
    }
  });
  fastify.post(`/`, async (req, res) => {
    console.log(`from ${process.pid}`);
    //const { key, value } = req.body;
    const { redis } = fastify;
    try {
      await redis.lpop("clients");
      return redis.lrange("clients", 0, -1);
    } catch (err) {
      return err;
    }
  });
};
