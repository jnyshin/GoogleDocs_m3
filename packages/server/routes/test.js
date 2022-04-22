export default async (fastify, opts) => {
  fastify.get(`/:key`, async (req, res) => {
    //return { hello: "world" };
    //currEditDoc.push("a");
    //redisClient.get("counter");
    // redis.get(`counter`, (err, val) => {
    //   if (err) {
    //     res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    //     return err;
    //   } else {
    //     console.log(val);
    //     res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    //     return `from ${process.pid}, ${val}`;
    //   }
    // });
    const { key } = req.params;
    console.log(key);
    console.log(`from ${process.pid}`);
    const { redis } = fastify;
    try {
      const value = await redis.get(key);
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
