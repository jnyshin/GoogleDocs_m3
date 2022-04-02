import express from "express";
import Conn from "../schema_conn";
import { DOCUMENT_ID } from "../store";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import e from "express";
const router = express.Router();

router.get("/:id", async (req, res) => {
  console.log("doc router reached");
  await Conn.findById(DOCUMENT_ID).exec((doc, err) => {
    if (!doc) {
      console.log("not found doc");
      const ops = err.data.ops;
      var cfg = {};
      const converter = new QuillDeltaToHtmlConverter(ops, cfg);
      const html = converter.convert();
      console.log(html);
      res.send(html);
    } else {
      console.log("found doc", ops);
      res.send(doc);
    }
  });
});
export default router;
