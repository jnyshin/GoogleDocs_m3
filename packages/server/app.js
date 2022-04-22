import mongoose from "mongoose";
import AutoLoad from "fastify-autoload";
import { join } from "path";
import { ERROR_MESSAGE, __dirname } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
import Fastify from "fastify";
const fastify = Fastify({
  logger: true,
});

const { NODE_ENV, SECRET } = process.env;
const PORT = NODE_ENV === "production" ? 80 : 8000;
const IP = NODE_ENV === "production" ? "209.94.56.137" : "127.0.0.1";

fastify.register(fastifyCors, {});

fastify.register(fastifyCookie, {
  secret:
    "hjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrk",
  parseOptions: {},
});
fastify.register(fastifySession, {
  secret:
    "hjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrk",
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
fastify.get("/", (req, res) => {
  console.log(`from ${process.pid}`);
  return { hello: "world" };
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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
