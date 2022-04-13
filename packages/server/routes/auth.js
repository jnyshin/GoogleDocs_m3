import express from "express";
import User from "../schema/user";
import nodemailer from "nodemailer";
import logging from "../logging";
import { DOMAIN_NAME, ERROR_MESSAGE } from "../store";
import { v4 as uuid } from "uuid";
import { google } from "googleapis";
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
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  return transporter;
};

const sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};

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
    logging.info("logged out");
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.json({ status: "OK" });
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send(ERROR_MESSAGE(`failed to logout`));
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
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
        text: `${key}`,
        html: `<b>http://${DOMAIN_NAME}/users/verify?_id=${userId}&email=${email}&key=${key}</b>`,
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
    res.send(ERROR_MESSAGE(`email verification failed`));
  }
});

export default router;
