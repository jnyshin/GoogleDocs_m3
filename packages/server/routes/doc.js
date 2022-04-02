import express from "express";
import Conn from "../schema_conn";

const router = express.Router();
router.get("/", async (req, res) => {
  console.log("doc router reached");
  const id = req.params.id;
  console.log(id);
  await Conn.findOne({ _id: id }, (err, doc) => {
    if (doc) {
      console.log(doc);
      res.send(doc);
    } else {
      console.log(err);
      res.send("ERROR");
    }
  });
});
export default router;
