// import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
// import { connection, ESclient } from "./app.js";
// import logging from "./logging.js";
// import { SHARE_DB_NAME } from "./store.js";
// let curr = 1;
// export const startUpdating = () => {
//   setInterval(function () {
//     if (process.env.instance_var === String(curr)) {
//       logging.info(`instance number matched ${String(curr)}`);
//       updateES();
//     }
//     if (curr === 8) {
//       curr = 0;
//     } else {
//       curr += 1;
//     }
//   }, 5000);
// };
// const updateES = () => {
//   try {
//     logging.info("updateES reached");
//     const start = performance.now();
//     connection.createFetchQuery(SHARE_DB_NAME, {}, {}, async (err, results) => {
//       const ret = [];
//       results.map((doc) => {
//         const ops = doc.data.ops;
//         const body = new QuillDeltaToHtmlConverter(ops, {})
//           .convert()
//           .replaceAll(/<[\w]*>/gi, "")
//           .replaceAll(/<\/[\w]*>/gi, "")
//           .replaceAll(/<[\w]*\/>/gi, "");
//         ret.push({ docid: doc.id, suggest_mix: body, search_mix: body });
//       });
//       if (!ret.length) {
//         return;
//       }
//       const operations = ret.flatMap((doc) => [
//         { update: { _id: doc.docid, _index: ELASTIC_INDEX } },
//         {
//           doc: doc,
//         },
//       ]);
//       await ESclient.bulk({
//         index: ELASTIC_INDEX,
//         operations,
//       });
//       const duration = performance.now() - start;
//       logging.info(`Updaing elastic search took ${duration}ms`);
//     });
//   } catch (err) {
//     logging.error("Error while updating");
//     logging.error(err);
//   }
// };
