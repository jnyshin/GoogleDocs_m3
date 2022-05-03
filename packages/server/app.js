import mongoose from "mongoose";
import ShareDB from "sharedb";
import MongoShareDB from "sharedb-mongo";
import {
  ERROR_MESSAGE,
  resetIndex,
  __dirname,
  elasticStringify,
  ELASTIC_INDEX,
  SHARE_DB_NAME,
} from "./store.js";
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
import { v4 as uuid } from "uuid";
const { NODE_ENV, PORT } = process.env;
const fastify = Fastify();
const IP = "127.0.0.1";
import { Client, Serializer } from "@elastic/elasticsearch";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { strictEqual } from "assert";
const RedisStore = connectRedis(fastifySession);

ShareDB.types.register(richText.type);
const MongoURL =
  NODE_ENV === "production"
    ? process.env.instance_var === "9" ||
      process.env.instance_var === "10" ||
      process.env.instance_var === "11" ||
      process.env.instance_var === "12"
      ? "mongodb://localhost/docs_clone"
      : "mongodb://10.9.4.238:27017/docs_clone"
    : "mongodb://localhost:27017/docs_clone";
const RedisURL =
  NODE_ENV === "production"
    ? process.env.instance_var === "9" ||
      process.env.instance_var === "10" ||
      process.env.instance_var === "11" ||
      process.env.instance_var === "12"
      ? "10.9.4.204"
      : "127.0.0.1"
    : "127.0.0.1";

const docsDB = MongoShareDB(MongoURL);
const backend = new ShareDB({
  db: docsDB,
  presence: true,
  doNotForwardSendPresenceErrorsToClient: true,
});
const ioredis = new IORedis(6379, RedisURL);
export const connection = backend.connect();

class MySerializer extends Serializer {
  serialize(obj) {
    return elasticStringify(obj);
  }
}
const clientOptions =
  NODE_ENV === "production"
    ? {
        node: "http://10.9.4.255:9200",
        Serializer: MySerializer,
      }
    : {
        cloud: {
          id: "My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJDNkOWI2NmViOTVkMTQ3MmI5YmFhYjQ4NGFhNDhkMmZjJDcwZDk2ZGFiMTJjYjQyZmFiOGJiMTU2NmJkMWM1MGQw",
        },
        auth: {
          username: "elastic",
          password: "gzq9AcKIBr3BKi7UXuvuutHr",
        },
        Serializer: MySerializer,
      };

export const ESclient = new Client(clientOptions);

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
logging.info(`${RedisURL}:${6379}`);
fastify.register(fastifyMultipart);
fastify.register(fastifyRedis, {
  host: RedisURL,
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
  if (NODE_ENV === "development" && req.url === "/") {
    res.redirect(303, "/users/login");
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
fastify.register(import("./routes/test.js"), {
  prefix: "/test",
});

fastify.post("/deleteAll", async () => {
  deleteAll();
});

fastify.register((fastifyInstance, options, done) => {
  mongoose
    .connect(MongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      deleteAll();
      console.log(`* Mongoose connected to ${MongoURL}`);
    })
    .catch((err) => {
      console.error("failed to connect with MongoDB", err);
      fastifyInstance.close();
    })
    .finally(() => done());
});

// let curr = 1;
// setInterval(function () {
//   if (process.env.instance_var === String(curr)) {
//     logging.info(`instance number matched ${String(curr)}`);
//     updateES();
//   }
//   if (curr === 8) {
//     curr = 0;
//   } else {
//     curr += 1;
//   }
// }, 5000);

const updateES = () => {
  try {
    logging.info("updateES reached");
    const start = performance.now();
    connection.createFetchQuery(SHARE_DB_NAME, {}, {}, async (err, results) => {
      const ret = [];
      results.map((doc) => {
        const ops = doc.data.ops;
        const body = new QuillDeltaToHtmlConverter(ops, {})
          .convert()
          .replaceAll(/<[\w]*>/gi, "")
          .replaceAll(/<\/[\w]*>/gi, "")
          .replaceAll(/<[\w]*\/>/gi, "");
        ret.push({ docid: doc.id, suggest_mix: body, search_mix: body });
      });
      if (!ret.length) {
        return;
      }
      const operations = ret.flatMap((doc) => [
        { update: { _id: doc.docid, _index: ELASTIC_INDEX } },
        {
          doc: doc,
        },
      ]);
      await ESclient.bulk({
        index: ELASTIC_INDEX,
        operations,
      });
      const duration = performance.now() - start;
      logging.info(`Updaing elastic search took ${duration}ms`);
    });
  } catch (err) {
    logging.error("Error while updating");
    logging.error(err);
  }
};

const start = async () => {
  try {
    await fastify.listen(PORT, IP);
    logging.info(`* Server started ${IP}:${PORT} `);
    if (process.env.instance_var === "1") {
      logging.info("Clear elastic search");
      await resetIndex(ELASTIC_INDEX);
    }
  } catch (err) {
    console.log(err);
    fastify.log.error(err);
  }
};
start();

process.on("SIGINT", function () {
  process.exit(0);
});

const deleteAll = async () => {
  try {
    const connection = mongoose.connection;
    const share_docs = connection.db.collection("share_docs");
    const o_share_docs = connection.db.collection("o_share_docs");
    const docs = connection.db.collection("docs");
    const image = connection.db.collection("images");
    const users = connection.db.collection("users");
    share_docs.deleteMany({});
    o_share_docs.deleteMany({});
    docs.deleteMany({});
    image.deleteMany({});
    users.deleteMany({});
    users.insertOne({
      _id: uuid(),
      email: "admin",
      password: "admin",
      name: "admin",
      enable: true,
    });
    if (NODE_ENV === "production") {
      await ioredis.flushall();
    }
    return { status: "ok" };
  } catch (err) {
    logging.error(err);
    logging.error("Failed to delete");
    return ERROR_MESSAGE("Failed to delete all");
  }
};
