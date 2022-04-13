import express from "express";
import User from "../schema/user";
import nodemailer from "nodemailer";
import logging from "../logging";
import { DOMAIN_NAME, ERROR_MESSAGE } from "../store";
import { v4 as uuid } from "uuid";
import { google } from "googleapis";
import path from "path";
import { __dirname } from "../store";

const client_path = path.join(__dirname, "../client/dist");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :(");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    name: "smtp.gmail.com",
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  return transporter;
};

const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  emailTransporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("mail server is ready to take our messages");
    }
  });
  await emailTransporter.sendMail(emailOptions, (err, info) => {
    if (err) {
      logging.error(err);
    } else {
      logging.info(info);
    }
  });
};

const router = express.Router();
router.get("/login", async (req, res) => {
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
          res.send({ status: "OK" });
        } else if (user.password === password) {
          logging.info("User first time logging in");
          req.session.authenticated = true;
          req.session.user = { id: user._id, email: email };
          res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
          res.send({ status: "OK" });
        } else {
          logging.info(`${email} failed to logged in (mismatch password)`);
          res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
          res.send(ERROR_MESSAGE("password not matched"));
        }
      }
    } else {
      logging.error(`User with email = ${email} does not exist`);
      res.send(ERROR_MESSAGE("user does not exist"));
    }
  } catch (err) {
    logging.error(err);
    res.send(ERROR_MESSAGE("Error in logged in"));
  }
});

router.post("/logout", (req, res) => {
  logging.info("[/user/logout] Route");
  if (req.session.authenticated) {
    req.session.destroy();
    logging.info("logged out");
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.json({ status: "OK" });
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
    res.send(ERROR_MESSAGE("already registered with same email"));
  } else {
    try {
      logging.info(`received new user with this email: ${email}`);
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

      const info = {
        from: process.env.EMAIL,
        to: email,
        subject: "Verification Code",
        html: `http://${DOMAIN_NAME}/users/verify?_id=${userId}&email=${email}&key=${key}`,
      };

      await sendEmail(info);
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
  const { _id, email, key } = req.query;
  logging.info(`Requested querystring is id=${_id} email=${email} key=${key}`);

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
    res.send(ERROR_MESSAGE(`email verification failed`));
  }
});

export default router;
