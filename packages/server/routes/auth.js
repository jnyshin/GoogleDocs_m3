import express from "express";
import User from "../schema/user";
import nodemailer from "nodemailer";
import logging from "../logging";
import { client_path, ERROR_MESSAGE } from "../store";
import { v4 as uuid } from "uuid";
import path from "path";

const router = express.Router();
router.get("/login", async (req, res) => {
  res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
  res.sendFile(path.join(client_path, "index.html"));
});

router.post("/login", async (req, res) => {
  logging.info("[/user/login] Route");
  const { email, password } = req.body;
  logging.info(`Requested Login for email=${email} password=${password}`);
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      if (!user.enable) {
        //not verified
        logging.error("failed to verify");
        res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
        res.send(ERROR_MESSAGE("did not verify"));
      } else {
        logging.info(`Req ressions: `);
        logging.info(req.session);
        //verified
        if (req.session.authenticated) {
          logging.info("User already logged in");
          res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
          res.send({ name: user.name });
        } else if (user.password === password) {
          logging.info("User first time logging in");
          req.session.authenticated = true;
          req.session.user = { id: user._id, email: email };
          res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
          res.send({ name: user.name });
        } else {
          logging.info(`${email} failed to logged in (mismatch password)`);
          res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
          res.send(ERROR_MESSAGE("password not matched"));
        }
      }
    } else {
      logging.error(`User with email = ${email} does not exist`);
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE("user does not exist"));
    }
  } catch (err) {
    logging.error("Error in logging in");
    logging.error(err);
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Error in logged in"));
  }
});

router.post("/logout", (req, res) => {
  logging.info("[/user/logout] Route");
  if (req.session.authenticated) {
    req.session.destroy();
    logging.info("logged out");
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send();
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE(`failed to logout`));
  }
});

router.post("/signup", async (req, res) => {
  logging.info("[/user/signup] Route");
  const { name, email, password } = req.body;
  logging.info(
    `Signing up for name=${name} email=${email} password=${password}`
  );
  const user = await User.findOne({ email: email });
  if (user) {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("already registered with same email"));
  } else {
    try {
      logging.info(`received new user with this email: ${email}`);
      const key = uuid();
      const userId = uuid();
      await User.create({
        _id: userId,
        name: name,
        email: email,
        password: password,
        enable: false,
        key: userId,
      });

      const info = {
        from: "icloud@icloud.cse356.compas.cs.stonybrook.edu",
        to: email,
        subject: "Verification Code",
        html: `http://icloud.cse356.compas.cs.stonybrook.edu/users/verify?key=${userId}`,
      };

      const mailOption = {
        host: "localhost",
        port: 25,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      };
      const transporter = nodemailer.createTransport(mailOption);
      transporter.sendMail(info);
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
  logging.info("[/user/verify] Route");
  const { key } = req.query;
  logging.info(`Requested querystring is key=${key}`);
  logging.info(req.query);

  try {
    const user = await User.findById(key);

    if (user && key === user.key) {
      await User.findByIdAndUpdate(user._id, { enable: true });
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send({ status: "OK" });
    } else {
      res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
      res.send(ERROR_MESSAGE(`email verification failed`));
    }
  } catch (err) {
    logging.error(err);
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE("Error while verify"));
  }
});

export default router;
