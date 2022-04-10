import express from "express";
import User from "../schema/user";
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  User.findOne({ username: username }, async (err, doc) => {
    if (err) {
      console.log("doc was not found");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send({ status: "ERROR" });
    } else if (doc && doc.password === password) {
      if (req.session.authenticated) {
        console.log("Already logged in");
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "OK" });
      } else {
        req.session.authenticated = true;
        req.session.user = req.body;
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "OK" });
      }
    } else {
      console.log("password didn't match");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send({ status: "ERROR" });
    }
  });
});
export default router;
