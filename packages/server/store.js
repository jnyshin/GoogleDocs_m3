import path from "path";
import { fileURLToPath } from "url";
import fastJson from "fast-json-stringify";
import { connection } from "./app.js";
export const clients = [];
export const DOMAIN_NAME =
  process.env.NODE_ENV === "production"
    ? "icloud.cse356.compas.cs.stonybrook.edu"
    : "localhost:8000";
export const ERROR_MESSAGE = (message) => {
  return { error: true, message: message };
};
const __filename = fileURLToPath(import.meta.url);
export const SHARE_DB_NAME = "share_docs";
// 👇️ "/home/john/Desktop/javascript"
export const __dirname = path.dirname(__filename);
export const currEditDoc = [];
export const payloadStringify = fastJson({
  title: "initial content w/ version",
  type: "object",
  properties: {
    content: { type: "array" },
    version: { type: "number" },
  },
});
export const presenceStringify = fastJson({
  title: "presence",
  type: "object",
  properties: {
    presence: {
      type: "object",
      properties: {
        id: { type: "string" },
        cursor: {
          type: "object",
          properties: {
            index: { type: "number" },
            length: { type: "number" },
            name: { type: "string" },
          },
        },
      },
    },
  },
});

export const clientStringify = fastJson({
  title: "new client",
  type: "object",
  properties: {
    id: { type: "string" },
    docId: { type: "string" },
  },
});

export const ackStringify = fastJson({
  title: "ack",
  type: "object",
  properties: {
    ack: { type: "array" },
  },
});

export const opStringify = fastJson({
  title: "op",
  type: "array",
});

export const docActionStringify = fastJson({
  title: "doc action",
  type: "object",
  properties: {
    action: { type: "string" },
    docId: { type: "string" },
  },
});
