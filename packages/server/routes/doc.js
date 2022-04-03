import express from "express";
import Conn from "../schema_conn";
import { DOCUMENT_ID } from "../store";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import e from "express";
const router = express.Router();

router.get("/:id", async (req, res) => {
  console.log("doc router reached");

  await Conn.findById(DOCUMENT_ID).exec((err, doc) => {
    if (err) {
      console.log("not found doc");
      res.send("wrong");
    }
    console.log("found doc");
    const ops = doc.data.ops;
    console.log(ops);
    const converter = new QuillDeltaToHtmlConverter(ops, {});
    const html = converter.convert();
    res.send(html);

    // if () {
    //   console.log("not found doc");
    //   const ops = err.data.ops;
    //   var cfg = {};
    //   const converter = new QuillDeltaToHtmlConverter(ops, cfg);
    //   const html = converter.convert();
    //   console.log(html);
    //   res.send(html);
    // } else {
    //   console.log("found doc", ops);
    //   res.send(doc);
    // }
  });
});
export default router;
