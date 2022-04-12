import express from "express";
import User from "../schema/user";
import nodemailer from "nodemailer";
import url from "url";
import logging from "../logging";
import { DOMAIN_NAME, ERROR_MESSAGE } from "../store";
import { v4 as uuid } from "uuid";
const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user.enable) {
      //not verified
      logging.error("failed to verify");
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("did not verify"));
    } else {
      //verified
      if (req.session.authenticated) {
        logging.info("User already logged in");
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "OK" });
      } else if (user.password === password) {
        req.session.authenticated = true;
        req.session.user = req.body;
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send({ status: "OK" });
      } else {
        logging.info(`${email} failed to logged in (mismatch password)`);
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send(ERROR_MESSAGE("password not matched"));
      }
    }
  } catch (err) {
    logging.error(err);
    res.send(ERROR_MESSAGE("Error in logged in"));
  }
});

router.post("/logout", (req, res) => {
  if (req.session.authenticated) {
    req.session.destroy();
    console.log("logged out");
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.json({ status: "OK" });
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.json({ status: "ERROR" });
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (user) {
    res.send(ERROR_MESSAGE("already registered with same email"));
  } else {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "experiment10103@gmail.com", // generated ethereal user
          pass: "tuvqit-cusVif-kodto5", // generated ethereal password
        },
      });

      console.log("received new user with this username: ", name);
      const key = Math.floor(Math.random() * 9999).toString();
      const userId = uuid();
      await User.create({
        _id: userId,
        name: name,
        email: email,
        password: password,
        enable: false,
        key: key,
      });

      const info = await transporter.sendMail({
        from: "experiment10103@gmail.com",
        to: email,
        subject: "Verification Code",
        text: `${key}`,
        html: `<b>http://${DOMAIN_NAME}/users/verify?_id=${userId}&email=${email}&key=${key}</b>`,
      });
      logging.info("Message sent: %s", info.messageId);

      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send({ status: "OK" });
    } catch (err) {
      console.log(err);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("failed to send email"));
    }
  }
});

router.get("/verify", async (req, res) => {
  console.log(req.query);
  const { _id, email, key } = req.query;

  let user = await User.findById(_id);
  if (!user) {
    user = await User.findOne({ email: email });
  }
  if (key === user.key) {
    await User.findByIdAndUpdate(_id, { enable: true });
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send({ status: "OK" });
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Key is not valid"));
  }
});

export default router;
