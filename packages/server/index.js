import http from "http";
import express from "express";
import cors from "cors";
import connRouter from "./routes/connection";
import docRouter from "./routes/doc";
import mongoose from "mongoose";
const app = express();
const server = http.createServer(app);

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

app.use("/", connRouter);

server.listen(8000, () => {
  console.log("server started at port 8000");
});
