import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import connRouter from "./routes/connection";
const app = express();
const server = http.createServer(app);
import mongoose from "mongoose";

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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST", "DELETE", "PUT"],
  },
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);
  socket.on("send-changes", (delta) => {
    console.log(delta);
  });
});

app.use("/", connRouter);

server.listen(8000, () => {
  console.log("server started at port 8000");
});
