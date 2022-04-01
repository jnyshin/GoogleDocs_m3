import express from "express";
import Conn from "../schema_conn";
const router = express.Router();

router.get("/connect/:id", (req, res) => {
  const id = req.params.id;

  //query from id and get body;
  Conn.findById(id, function (err, doc) {
    try {
      if (doc) {
        doc.save();
        res.send(doc.data);
      } else {
        const newConn = new Conn({ _id: id, data: "" }); //make a new Conn document with connection ID
        newConn.save();
        res.send(newConn.data);
      }
    } catch (err) {
      console.log(err);
      res.send("ERROR");
    }
  });
  const sendmsg = (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    setInterval(function () {
      constructSSE(res, 1000);
    });
  };
  const constructSSE = (res) => {
    res.write("message sent at ", new Date());
  };
  sendmsg(req, res);
  //res.send("this is test body");
});
export default router;
