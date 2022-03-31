import express from "express";
import Conn from "../schema_conn";

const router = express.Router();

router.get("/connect/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  //query from id and get body;
  Conn.findOne({ id: id }, function (err, doc) {
    try {
      if (doc) {
        doc.body = "This connection already happened"; //check whether the connection was successfully saved
        doc.save();
        res.send(doc.body);
      } else {
        const newConn = new Conn({ id: id, body: "this is test body" }); //make a new Conn document with connection ID
        newConn.save();
        res.send(newConn.body);
      }
    } catch (err) {
      console.log(err);
      res.send("ERROR");
    }
  });
  //res.send("this is test body");
});
export default router;
