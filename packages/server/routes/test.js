const myCache = new NodeCache();
import IORedis from "ioredis";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import NodeCache from "node-cache";
import { connection } from "../app.js";
import { ERROR_MESSAGE } from "../store.js";
import Docs from "../schema/docs.js";

export default async (fastify, opts) => {
  fastify.get(`/`, async (req, res) => {
    return {};
  });
  fastify.get(`/pub`, async (req, res) => {
    return {};
  });
};
