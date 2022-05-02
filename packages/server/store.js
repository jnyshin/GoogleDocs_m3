import path, { resolve } from "path";
import { fileURLToPath } from "url";
import fastJson from "fast-json-stringify";
// import { connection } from "./app.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { ESclient } from "./app.js";
import logging from "./logging.js";
export const clients = [];
export const connectedDocId = [];
export const ERROR_MESSAGE = (message) => {
  return { error: true, message: message };
};
const __filename = fileURLToPath(import.meta.url);
export const SHARE_DB_NAME = "share_docs";
export const ELASTIC_INDEX = "ss_index";
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

const index = {
  type: "object",
  properties: {
    docid: { type: "string" },
    suggest_name: { type: "string" },
    search_name: { type: "string" },
    suggest_body: { type: "string" },
    search_body: { type: "string" },
  },
};
const update = {
  type: "object",
  properties: {
    update: {
      _id: { type: "string" },
      _index: { type: "string" },
    },
  },
};
const partialDoc = {
  type: "object",
  properties: {
    doc: {
      docid: { type: "string" },
      suggest_body: { type: "string" },
      search_body: { type: "string" },
    },
  },
};
export const elasticStringify = fastJson({
  anyOf: [index, update, partialDoc],
});

export const searchStringify = fastJson({
  type: "array",
  items: {
    default: [
      {
        type: "object",
        properties: {
          docid: { type: "string" },
          body: { type: "string" },
          snippet: { type: "string" },
        },
      },
    ],
  },
});
export const suggestStringify = fastJson({
  type: "array",
  items: {
    default: [
      {
        type: "string",
      },
    ],
  },
});

export const fetchDoc = (docId) => {
  const query = connection.createFetchQuery(SHARE_DB_NAME, { _id: docId });
  const getDocPromise = new Promise((resolve, reject) => {
    query.on("ready", () => {
      try {
        resolve(query.results[0]);
      } catch (err) {
        reject(err);
      }
    });
  });
  return getDocPromise;
};

export const fetchCreateDocs = (docId) => {
  const share_doc = connection.get(SHARE_DB_NAME, docId);
  const promise = new Promise((resolve, reject) => {
    share_doc.fetch((err) => {
      if (err) reject(err);
      else {
        resolve(share_doc.create([], "rich-text"));
      }
    });
  });
  return promise;
};

export const docSubmitOp = (document, op, id) => {
  const docSubmitOpPromise = new Promise((resolve, reject) => {
    document.submitOp(op, { source: id }, () => {
      try {
        resolve({ ack: op });
      } catch (err) {
        reject(err);
      }
    });
  });
  return docSubmitOpPromise;
};

//call resetIndex(research_index) to reset it!!
export const resetIndex = async (index) => {
  logging.info("resetIndex Reached");
  await ESclient.deleteByQuery({
    index: index,
    body: {
      query: {
        match_all: {},
      },
    },
  });
};
