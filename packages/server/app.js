import mongoose from "mongoose";
// import ShareDB from "sharedb";
// import MongoShareDB from "sharedb-mongo";
import {
  ERROR_MESSAGE,
  resetIndex,
  __dirname,
  elasticStringify,
  ELASTIC_INDEX,
} from "./store.js";
// import fastifyCookie from "fastify-cookie";
// import fastifyCors from "fastify-cors";
// import fastifySession from "@fastify/session";
// import fastifyStatic from "fastify-static";
// import fastifyMultipart from "fastify-multipart";
// import fastifyUrlData from "fastify-url-data";
// import IORedis from "ioredis";
// import connectRedis from "connect-redis";
import Fastify from "fastify";
import logging from "./logging.js";
// import fastifyRedis from "fastify-redis";
// import { join } from "path";
// import richText from "rich-text";
// import Docs from "./schema/docs.js";
// import { v4 as uuid } from "uuid";
const { NODE_ENV, PORT } = process.env;
const fastify = Fastify();
const IP = "127.0.0.1";
import { Client, Serializer } from "@elastic/elasticsearch";
// const RedisStore = connectRedis(fastifySession);
// const ioredis = new IORedis();

// ShareDB.types.register(richText.type);
// const docsDB = MongoShareDB("mongodb://10.9.4.238:27017/docs_clone");
// const backend = new ShareDB({
//   db: docsDB,
//   presence: true,
//   doNotForwardSendPresenceErrorsToClient: true,
// });

// export const connection = backend.connect();

class MySerializer extends Serializer {
  serialize(obj) {
    return elasticStringify(obj);
  }
}
const clientOptions =
  process.env.NODE_ENV === "production"
    ? {
        node: "http://194.113.75.5",
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

// fastify.register(fastifyCors, {});
// fastify.register(fastifyCookie, {
//   secret: "2BCC52D156A297EB555F33A2A605E8FB",
//   parseOptions: {},
// });
// fastify.register(fastifySession, {
//   store: new RedisStore({
//     client: ioredis,
//     ttl: 86400,
//   }),
//   secret: "2BCC52D156A297EB555F33A2A605E8FB",
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24 * 7,
//     httpOnly: true,
//     secure: false,
//   },
//   saveUninitialized: true,
//   resave: true,
// });
// fastify.register(fastifyStatic, {
//   root: process.env.NODE_ENV === "production" ? "/" : join(__dirname, "dist"),
// });

// fastify.register(fastifyMultipart);
// fastify.register(fastifyRedis, {
//   host: "127.0.0.1",
//   port: 6379, // Redis port
//   family: 4, // 4 (IPv4) or 6 (IPv6)
// });
// fastify.register(fastifyUrlData);
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

// fastify.register(import("./routes/users.js"), {
//   prefix: "/users",
// });
// fastify.register(import("./routes/collection.js"), {
//   prefix: "/collection",
// });
// fastify.register(import("./routes/doc.js"), {
//   prefix: "/doc",
// });
// fastify.register(import("./routes/home.js"), {
//   prefix: "/home",
// });
// fastify.register(import("./routes/media.js"), {
//   prefix: "/media",
// });
fastify.register(import("./routes/test.js"), {
  prefix: "/test",
});

// fastify.post("/deleteAll", async () => {
//   deleteAll();
// });

fastify.register((fastifyInstance, options, done) => {
  mongoose
    .connect("mongodb://10.9.4.238/docs_clone", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      // deleteAll();
      console.log("* Mongoose connected");
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
    if (process.env.instance_var === "1") {
      logging.info("Clear elastic search");
      // await resetIndex(ELASTIC_INDEX);
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

// const deleteAll = async () => {
//   try {
//     const connection = mongoose.connection;
//     const share_docs = connection.db.collection("share_docs");
//     const o_share_docs = connection.db.collection("o_share_docs");
//     const docs = connection.db.collection("docs");
//     const image = connection.db.collection("images");
//     const users = connection.db.collection("users");
//     share_docs.deleteMany({});
//     o_share_docs.deleteMany({});
//     docs.deleteMany({});
//     image.deleteMany({});
//     users.deleteMany({});
//     users.insertOne({
//       _id: uuid(),
//       email: "admin",
//       password: "admin",
//       name: "admin",
//       enable: true,
//     });
//     if (NODE_ENV === "production") {
//       await ioredis.flushall();
//     }
//     return { status: "ok" };
//   } catch (err) {
//     logging.error(err);
//     logging.error("Failed to delete");
//     return ERROR_MESSAGE("Failed to delete all");
//   }
// };
