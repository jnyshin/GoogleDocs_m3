import mongoose from "mongoose";
import AutoLoad from "fastify-autoload";
import { join } from "path";
import { ERROR_MESSAGE, __dirname, currEditDoc } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
import fastify from "fastify";
import fastifyRedis from "fastify-redis";
//import redis from "redis";

//const redisClient = redis.createClient();

const { NODE_ENV, SECRET } = process.env;
export default async (fastify, opts) => {
  fastify.register(fastifyCors, {});

  fastify.register(fastifyCookie, {
    secret: SECRET,
    parseOptions: {},
  });
  fastify.register(fastifySession, {
    secret: SECRET,
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
  fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
  });

  fastify.register(fastifyRedis, {
    host: "127.0.0.1",
  });

  fastify.addHook("preHandler", (req, res, next) => {
    req.log.info(`incoming request from ${req.ip}`);
    if (!req.url.startsWith("/user")) {
      if (!req.session.user) {
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send(ERROR_MESSAGE("Not logged in"));
      }
    }
    next();
  });
  fastify.get(`/`, async (req, res) => {
    console.log(`from ${process.pid}`);
    //return { hello: "world" };
    //currEditDoc.push("a");
    //redisClient.get("counter");
    const { redis } = app;
    await redis.get(`counter`, (err, val) => {
      console.log(val);
      res.send(`from ${process.pid}, ${val}`);
    });
    redis.incr(`counter`);
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
};

const start = async () => {
  try {
    await app.listen(NODE_ENV === "production" ? 80 : 8000);
    console.log(NODE_ENV);
    const address = app.server.address();
    console.log(address);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (numCore > 1) {
  if (cluster.isPrimary) {
    for (let i = 0; i < numCore; i++) {
      cluster.fork();
    }
    cluster.on("exit", (worker) => {
      console.log("Worker", worker.id, " has exited");
    });
  }
}
