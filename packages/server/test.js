import fastify from "fastify";
const server = fastify({
  logger: true,
  trustProxy: "209.94.56.137",
});
server.get("/", async (request, reply) => {
  console.log(`from ${process.pid}`);
  return { pong: "it worked!" };
});

const start = async () => {
  try {
    await server.listen(3000);

    const address = server.server.address();
    const port = typeof address === "string" ? address : address?.port;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
