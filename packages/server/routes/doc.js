import express from "express";
import Conn from "../schema_conn";

const router = express.Router();
router.get("/doc", async (req, res) => {
  console.log("doc router reached");
  //   const id = req.params.id;
  //   console.log(id);
  //   doc = await Conn.findById(id);
  //   console.log(doc);
  //   res.send(doc);
});
export default router;
