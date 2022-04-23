import IORedis from "ioredis";
import { v4 as uuid } from "uuid";
const sub = new IORedis();
const pub = new IORedis();
export default async (fastify, opts) => {
  fastify.get(`/sub`, async (req, res) => {
    // There's also an event called 'messageBuffer', which is the same as 'message' except
    // it returns buffers instead of strings.
    // It's useful when the messages are binary data.
    const { redis } = fastify;

    const value = await redis.call("JSON.GET", "doc", "$..f1");
    return {};
  });
  fastify.get(`/pub`, async (req, res) => {
    const { redis } = fastify;
    await redis.call("JSON.SET", "doc", "$", '[{"f1": {"a":1}, "f2":{"a":2}}]');
    // Message can be either a string or a buffer
    // Message can be either a string or a buffer

    return {};
  });
};
