import mongoose from "mongoose";
import AutoLoad from "fastify-autoload";
import { join } from "path";
import { ERROR_MESSAGE, __dirname } from "./store.js";
import fastifyCookie from "fastify-cookie";
import fastifyCors from "fastify-cors";
import fastifySession from "@fastify/session";
import fastifyStatic from "fastify-static";
import fastifyMultipart from "fastify-multipart";
import fastify from "fastify";

const { NODE_ENV, SECRET } = process.env;
const PORT = NODE_ENV === "production" ? 80 : 8000;
const IP = NODE_ENV === "production" ? "209.94.56.137" : "127.0.0.1";
const app = fastify({ logger: true });

app.register(fastifyCors, {});

app.register(fastifyCookie, {
  secret:
    "hjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrkhjadksegdjrk",
  parseOptions: {},
});
app.register(fastifySession, {
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

app.register(fastifyStatic, {
  root: join(__dirname, "dist"),
});

app.register(fastifyMultipart);

app.register(AutoLoad, {
  dir: join(__dirname, "routes"),
});
app.addHook("preHandler", (req, res, next) => {
  req.log.info(`incoming request from ${req.ip}`);
  if (!req.url.startsWith("/user")) {
    if (!req.session.user) {
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("Not logged in"));
    }
  }
  next();
});
app.get("/", (req, res) => {
  console.log(`from ${process.pid}`);
  return { hello: "world" };
});
app.register((fastifyInstance, options, done) => {
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
app.listen(PORT, IP);
