import fastify from "fastify";
const server = fastify({
  logger: true,
});
server.get("/", async (request, reply) => {
  console.log(`from ${process.pid}`);
  return { pong: "it worked!" };
});

server.listen(3000, "209.94.56.137", (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});