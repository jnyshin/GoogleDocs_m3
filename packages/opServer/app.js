import mongoose from "mongoose";
import ShareDB from "sharedb";
import MongoShareDB from "sharedb-mongo";
import { ERROR_MESSAGE } from "../server/store.js";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import IORedis from "ioredis";
import connectRedis from "connect-redis";
import Fastify from "fastify";
import logging from "./logging.js";
import fastifyRedis from "fastify-redis";
import fastifyCookie from "fastify-cookie";
import richText from "rich-text";
import Docs from "../server/schema/docs.js";

const fastify = Fastify();

const { PORT } = process.env;
const IP = "127.0.0.1";
// const IP = process.env.IP
//   ? "icloud.cse356.compas.cs.stonybrook.edu"
//   : "127.0.0.1";
const RedisStore = connectRedis(fastifySession);
const ioredis = new IORedis();
await ioredis.del("clients");

ShareDB.types.register(richText.type);

const docsDB = MongoShareDB("mongodb://localhost/docs_clone");
const backend = new ShareDB({
  db: docsDB,
  presence: true,
  doNotForwardSendPresenceErrorsToClient: true,
});

export const connection = backend.connect();

fastify.register(fastifyCors, {});
fastify.register(fastifyCookie, {
  secret: "2BCC52D156A297EB555F33A2A605E8FB",
  parseOptions: {},
});
fastify.register(fastifySession, {
  store: new RedisStore({
    client: ioredis,
    ttl: 86400,
  }),
  secret: "2BCC52D156A297EB555F33A2A605E8FB",
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: false,
  },
  saveUninitialized: true,
  resave: true,
});
fastify.register(fastifyRedis, {
  host: "127.0.0.1",
  port: 6379, // Redis port
  family: 4, // 4 (IPv4) or 6 (IPv6)
});
fastify.addHook("preHandler", (req, res, next) => {
  logging.info(`incoming request from [${req.url}]`);
  if (!req.session.user) {
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Not logged in"));
  }
  next();
});

fastify.register(import("./routes/doc.js"), {
  prefix: "/doc",
});

const start = async () => {
  try {
    await fastify.listen(PORT, IP);
    logging.info(`* OP Server started ${IP}:${PORT} `);

    await Docs.deleteMany({});
  } catch (err) {
    console.log(err);
    fastify.log.error(err);
  }
};
start();

process.on("SIGINT", function () {
  process.exit(0);
});
