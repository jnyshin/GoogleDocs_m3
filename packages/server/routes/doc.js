import express from "express";
import Conn from "../schema_conn";
import { DOCUMENT_ID } from "../store";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
const router = express.Router();

router.get("/:id", async (req, res) => {
  console.log("[doc route]");

  await Conn.findById(DOCUMENT_ID).exec((err, doc) => {
    if (err) {
      console.log("not found doc");
      res.send("wrong");
    }
    console.log("found doc");
    const ops = doc.data.ops;
    console.log(ops);
    const converter = new QuillDeltaToHtmlConverter(ops, {});
    var html = converter.convert();
    console.log("converted to: " + html);
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(html);
  });
});
export default router;
