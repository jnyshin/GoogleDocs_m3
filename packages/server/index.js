import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import docRouter from "./routes/doc";
import authRouter from "./routes/auth";
import collectionRouter from "./routes/collection";
import mediaRouter from "./routes/media";
import path from "path";
import session from "express-session";
import homeRouter from "./routes/home";
import { __dirname } from "./store";
dotenv.config();

const PORT = process.env.NODE_ENV === "production" ? 80 : 8000;

const app = express();

// 👇️ "/home/john/Desktop/javascript"

const client_path = path.join(__dirname, "../client/dist");

app.use(express.static(client_path));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      // httpOnly: true,
      // secure: true,
      // sameSite: "none",
    },
  })
);
app.use("/users", authRouter);
app.use("/doc", docRouter);
app.use("/media", mediaRouter);
app.use("/collection", collectionRouter);
app.use("/home", homeRouter);

mongoose
  .connect("mongodb://localhost/docs_clone", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("mongoose connected");
  })
  .catch((err) => {
    console.error("failed to connect with MongoDB", err);
  });

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
