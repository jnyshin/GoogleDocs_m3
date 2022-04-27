import mongoose from "mongoose";
import ShareDB from "sharedb";
import MongoShareDB from "sharedb-mongo";
import { ERROR_MESSAGE, __dirname } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
import fastifyUrlData from "fastify-url-data";
import IORedis from "ioredis";
import connectRedis from "connect-redis";
import Fastify from "fastify";
import logging from "./logging.js";
import fastifyRedis from "fastify-redis";
import { join } from "path";
import richText from "rich-text";
import Docs from "./schema/docs.js";
const { NODE_ENV } = process.env;
const fastify = Fastify();

const { PORT } = process.env;
const IP = "127.0.0.1";
const RedisStore = connectRedis(fastifySession);
const ioredis = new IORedis();
await ioredis.del("clients");

ShareDB.types.register(richText.type);
console.log();
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
fastify.register(fastifyStatic, {
  root: process.env.NODE_ENV === "production" ? "/" : join(__dirname, "dist"),
});

fastify.register(fastifyMultipart);
fastify.register(fastifyRedis, {
  host: "127.0.0.1",
  port: 6379, // Redis port
  family: 4, // 4 (IPv4) or 6 (IPv6)
});
fastify.register(fastifyUrlData);
fastify.addHook("preHandler", (req, res, next) => {
  logging.info(`incoming request from [${req.url}]`);
  if (
    req.url.startsWith("/doc") ||
    req.url.startsWith("/collection") ||
    req.url.startsWith("/home") ||
    req.url.startsWith("/media")
  ) {
    if (!req.session.user) {
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Not logged in"));
    }
  }
  next();
});

fastify.addHook("onRequest", (req, res, next) => {
  if (req.url.startsWith("/media/access")) {
    const { mediaID } = req.params;
    ioredis.get(mediaID, (err, data) => {
      if (data) {
        return res.sendFile(data);
      } else {
        next();
      }
    });
  } else {
    next();
  }
});
fastify.register(import("./routes/users.js"), {
  prefix: "/users",
});
fastify.register(import("./routes/collection.js"), {
  prefix: "/collection",
});
fastify.register(import("./routes/doc.js"), {
  prefix: "/doc",
});
fastify.register(import("./routes/home.js"), {
  prefix: "/home",
});
fastify.register(import("./routes/media.js"), {
  prefix: "/media",
});
fastify.register(import("./routes/test.js"), {
  prefix: "/test",
});
fastify.register(import("./routes/index.js"), {
  prefix: "/index",
});

fastify.register((fastifyInstance, options, done) => {
  mongoose
    .connect("mongodb://localhost/docs_clone", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("mongoose connected");
    })
    .catch((err) => {
      console.error("failed to connect with MongoDB", err);
      fastifyInstance.close();
    })
    .finally(() => done());
});

const start = async () => {
  try {
    await fastify.listen(PORT, IP);
    logging.info(`* Server started ${IP}:${PORT} `);
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
