import path, { resolve } from "path";
import { fileURLToPath } from "url";
import fastJson from "fast-json-stringify";
import { connection } from "./app.js";
import Docs from "./schema/docs.js";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
export const clients = [];

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

export const elasticStringify = fastJson({
  type: "object",
  properties: {
    docid: { type: "string" },
    name: { type: "string" },
    body: { type: "string" },
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

export const fetchAllDocs = () => {
  const ret = [];
  // const { name:"", op: "", docId: ""}
  const getDocNamePromise = new Promise(async (resolve, reject) => {
    const docsNames = await Docs.find({}).select("name");
    try {
      resolve(docsNames);
    } catch (err) {
      reject(err);
    }
  });
  const query = connection.createFetchQuery(SHARE_DB_NAME, {});
  const getDocPromise = new Promise((resolve, reject) => {
    query.on("ready", () => {
      try {
        const ret = [];
        query.results.map((doc) => ret.push({ ops: doc.data.ops }));
        resolve(ret);
      } catch (err) {
        reject(err);
      }
    });
  });
  return Promise.all([getDocNamePromise, getDocPromise]).then((values) => {
    const ret = [];
    const nameAndIds = values[0];
    const ops = values[1];
    nameAndIds.map((value, index) => {
      let html = new QuillDeltaToHtmlConverter(ops[index].ops, {}).convert();
      let newhtml = html
        .replaceAll(/<[\w]*>/gi, "")
        .replaceAll(/<\/[\w]*>/gi, "")
        .replaceAll(/<[\w]*\/>/gi, "");
      const newObj = {
        id: value._id,
        name: value.name,
        body: newhtml,
      };
      ret.push(newObj);
    });
    return ret;
  });
};

export const fetchUpdateDocs = () => {
  const query = connection.createFetchQuery(SHARE_DB_NAME);
  const getDocPromise = new Promise((resolve, reject) => {
    query.on("ready", () => {
      try {
        resolve(query.results);
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
