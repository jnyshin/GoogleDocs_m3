import express from "express";
import Docs from "../schema/docs";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
const router = express.Router();

router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  await Docs.findById(id).exec((err, doc) => {
    if (err) {
      // console.log("not found doc");
      res.send("wrong");
    }
    // console.log("found doc");
    const ops = doc.data.ops;
    // console.log(ops);
    const converter = new QuillDeltaToHtmlConverter(ops, {});
    var html = converter.convert();
    // console.log("converted to: " + html);
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(html);
  });
});
export default router;
