import fastify from "fastify";

fastify({
  logger: true,
});
fastify.get("/", async (request, reply) => {
  console.log(`from :${process.pid}`);
  return { hello: "world" };
});

fastify.listen(3000);
