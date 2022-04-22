import mongoose from "mongoose";
import { join } from "path";
import { ERROR_MESSAGE, __dirname, currEditDoc } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
import { RedisStore } from "fastify-redis-session";
import redis from "redis";
import Fastify from "fastify";
import logging from "./logging.js";

//const redisClient = redis.createClient({ host: "127.0.0.1", port: 6379 });

const { NODE_ENV } = process.env;
// const fastify = Fastify({
//   logger: {
//     level: "info",
//     file: join(__dirname, "log", "info.txt"),
//   },
// });
const fastify = Fastify({
  logger: true,
});
const PORT = NODE_ENV === "production" ? 80 : 8000;
const IP = NODE_ENV === "production" ? "209.94.56.137" : "127.0.0.1";
const redisClient = redis.createClient({ host: IP, port: 6379 });
redisClient.connect().then(console.log("redis connected"));

fastify.register(fastifyCors, {});

fastify.register(fastifyCookie, {
  secret: "2BCC52D156A297EB555F33A2A605E8FB",
  parseOptions: {},
});
fastify.register(fastifySession, {
  store: new RedisStore({
    client: redisClient,
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
  root: join(__dirname, "dist"),
});

fastify.register(fastifyMultipart);
fastify.register(fastifyRedis, {
  client: redisClient,
});

fastify.addHook("preHandler", (req, res, next) => {
  logging.info(`incoming request from ${req.url}`);
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

fastify.get(`/`, (req, res) => {
  console.log(`from ${process.pid}`);
  //return { hello: "world" };
  //currEditDoc.push("a");
  //redisClient.get("counter");
  //const { redis } = fastify;
  redisClient.get(`counter`, (err, val) => {
    if (err) {
      res.send(err);
    } else {
      console.log(val);
      res.send(`from ${process.pid}, ${val}`);
    }
  });
  redisClient.incr(`counter`);
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
    logging.info(`Server started ${IP}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
