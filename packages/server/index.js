import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connRouter from "./routes/connection";
import docRouter from "./routes/doc";
import opRouter from "./routes/op";
import authRouter from "./routes/auth";
import Docs from "./schema/docs";
import path from "path";
import { fileURLToPath } from "url";

import session from "express-session";
import { v4 as uuidv4 } from "uuid";
const PORT = 8000;
const sessionStore = new session.MemoryStore();

const app = express();

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

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

app.post("/addDoc", async (req, res) => {
  if (req.params.id) {
    //In case it requires id from param
    await Docs.create({
      _id: req.params.id,
      data: { ops: [{ insert: "" }] },
    });
  } else {
    await Docs.create({
      _id: uuidv4(),
      data: { ops: [{ insert: "" }] },
    });
  }

  const documents = await Docs.find();
  res.send(documents);
});

app.get("/showlist", async (req, res) => {
  const documents = await Docs.find();

  res.send(documents);
});
app.use("/connect", connRouter);
app.use("/doc", docRouter);
app.use("/op", opRouter);
app.use("/", authRouter);
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
