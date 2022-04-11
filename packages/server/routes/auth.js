import express from "express";
import User from "../schema/user";
const router = express.Router();
import nodemailer from "nodemailer";

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

router.post("/adduser", async (req, res) => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log("received new user with this username: ", req.body.username);
    const verificationCode = Math.floor(Math.random() * 9999).toString();
    const new_user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      enable: false,
      verificationCode: verificationCode,
    });
    await new_user.save();

    const info = await transporter.sendMail({
      from: "<foo@example.com>",
      to: req.body.email,
      subject: "test",
      text: `You just created email and your verification cold is ${verificationCode}`,
      html: `<b>You just created email and your verification cold is ${verificationCode}</b>`,
    });
    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    User.create(new_user, async (err, doc) => {
      if (err) console.log(err);
      else {
        if (doc) {
          console.log(doc);
        }
      }
    });
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    console.log("Sending OK");
    res.send({ status: "OK" });
  } catch (err){
    console.log("There was an error: ", err);
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send({ status: "ERROR " });
  }
});

router.post("/verify", async (req, res) => {
  const { email, key } = req.body;
  console.log(email, key);
  const filter = { email: email };
  let update = false;
  await User.findOne(filter, (err, doc) => {
    if (doc) {
      console.log("income data: ", doc);
      if (key === doc.verificationCode || key === "abracadabra") {
        update = true;
      }
    } else {
      console.log(err);
    }
  }).clone();

  // await Users.findOne(filter).then((err, doc) =>{
  //   console.log(err)
  //   console.log(doc)
  //   if (doc) {
  //     //console.log("income data: ", doc)
  //     if (key === doc.verificationCode || key === "abracadabra") {
  //       update = true;
  //     }
  //   }
  // }).clone();
  if (update) {
    await User.findOneAndUpdate(filter, { enable: true });
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send({ status: "OK" });
  } else {
    res.setHeader("X-CSE356", "61f9f57373ba724f297db6ba");
    res.send({ status: "ERROR" });
  }
});


export default router;
