import { ERROR_MESSAGE } from "../store.js";
import User from "../schema/user.js";
import logging from "../logging.js";
import { v4 as uuid } from "uuid";
import nodemailer from "nodemailer";
const userRouter = async (fastify, opts) => {
  fastify.get("/login", (req, res) => {
    res.header("X-CSE356", "61f9f57373ba724f297db6ba");
    return res.sendFile(
      process.env.NODE_ENV === "production"
        ? "/var/www/html/index.html"
        : "index.html"
    );
  });
  fastify.post("/login", async (req, res) => {
    const { email, password } = req.body;
    //logging.info(`Requested Login for email=${email} password=${password}`);
    try {
      const user = await User.findOne({ email: email });
      if (user) {
        if (!user.enable) {
          //not verified
          //logging.error("Failed to verify");
          res.header("X-CSE356", "61f9f57373ba724f297db6ba");
          return ERROR_MESSAGE("did not verify");
        } else {
          //verified
          if (req.session.authenticated) {
            res.header("X-CSE356", "61f9f57373ba724f297db6ba");
            return { name: user.name };
          } else if (user.password === password) {
            req.session.authenticated = true;
            req.session.user = { id: user._id, email: email };
            res.header("X-CSE356", "61f9f57373ba724f297db6ba");
            return { name: user.name };
          } else {
            res.header("X-CSE356", "61f9f57373ba724f297db6ba");
            return ERROR_MESSAGE("password not matched");
          }
        }
      } else {
        //logging.error(`User with email = ${email} does not exist`);
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE("user does not exist");
      }
    } catch (err) {
      //logging.error("Error in logging in");
      //logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("Error in logged in");
    }
  });
  fastify.post("/logout", async (req, res) => {
    if (req.session.authenticated) {
      try {
        await req.session.destroy();
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return { message: "logged out" };
      } catch (err) {
        return err;
      }
    } else {
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE(`failed to logout`);
    }
  });
  fastify.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("already registered with same email");
    } else {
      try {
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
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return { status: "ok" };
      } catch (err) {
        //logging.error(err);
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE("failed to send email");
      }
    }
  });
  fastify.get("/verify", async (req, res) => {
    const { key } = req.query;
    try {
      const user = await User.findById(key);
      if (user && key === user.key) {
        await User.findByIdAndUpdate(user._id, { enable: true });
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return { status: "ok" };
      } else {
        res.header("X-CSE356", "61f9f57373ba724f297db6ba");
        return ERROR_MESSAGE(`email verification failed`);
      }
    } catch (err) {
      //logging.error(err);
      res.header("X-CSE356", "61f9f57373ba724f297db6ba");
      return ERROR_MESSAGE("Error while verify");
    }
  });
};
export default userRouter;
