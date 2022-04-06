import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connRouter from "./routes/connection";
import docRouter from "./routes/doc";
import opRouter from "./routes/op";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const client_path = path.join(__dirname, "../client/dist");

app.use(express.static(client_path));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(client_path + "/index.html");
  console.log(client_path + "/index.css");
});

app.use("/connect", connRouter);
app.use("/doc", docRouter);
app.use("/op", opRouter);
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
app.listen(8000, () => {
  console.log("server started at port 80");
});
