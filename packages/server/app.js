import mongoose from "mongoose";
import AutoLoad from "fastify-autoload";
import { join } from "path";
import { ERROR_MESSAGE, __dirname } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";

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
    options: Object.assign({}, opts),
  });
  fastify.addHook("preHandler", (req, res, next) => {
    req.log.info(`incoming request from ${req.ip}`);
    if (!req.url.startsWith("/user")) {
      if (!req.session.user) {
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE("Not logged in");
      }
    }
    next();
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
