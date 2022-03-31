import express from "express";

const router = express.Router();

router.get("/connect/:id", (req, res) => {
  const id = req.params.id;
  //   console.log(id);
  //query from id and get body;
  res.send("this is test body");
});
export default router;
