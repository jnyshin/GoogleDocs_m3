import express from "express";
import Docs from "../schema/docs";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { ERROR_MESSAGE } from "../store";
const router = express.Router();

router.get("/get/:id", async (req, res) => {
  const id = req.params.id;
  await Docs.findById(id).exec((err, doc) => {
    if (err) {
      res.send(ERROR_MESSAGE(`not found doc`));
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
