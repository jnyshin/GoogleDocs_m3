import IORedis from "ioredis";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
import NodeCache from "node-cache";

export default async (fastify, opts) => {
  fastify.get(`/sub`, async (req, res) => {
    const { redis } = fastify;
    const myCache = new NodeCache();
    myCache.set("Test1", "This is Test");

    return {};
  });
  fastify.get(`/pub`, async (req, res) => {
    const { redis } = fastify;
    const myCache = new NodeCache();
    const value = myCache.get("Test1");
    console.log(value);

    return {};
  });
};
