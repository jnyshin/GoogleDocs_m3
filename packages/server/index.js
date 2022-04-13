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
//import Home from "../client/src/Home";
import { __dirname } from "./store";
dotenv.config();

const PORT = process.env.NODE_ENV === "production" ? 80 : 8000;
const sessionStore = new session.MemoryStore();
const app = express();

// 👇️ "/home/john/Desktop/javascript"

const client_path = path.join(__dirname, "../client/dist");

app.use(express.static(client_path));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "docs-session",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    saveUninitialized: true,
    resave: true,
    store: sessionStore,
  })
);

app.use("/doc", docRouter);
app.use("/media", mediaRouter);
app.use("/collection", collectionRouter);
app.use("/users", authRouter);
// app.get("/home", (req, res) => {
//   const homeToHtml = Home();
//   console.log(homeToHtml);
//   res.send("OK");
// });

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
