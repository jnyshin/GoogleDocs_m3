import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import userRouter from "./routes/user";
const app = express();
const server = http.createServer(app);
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
});

app.use("/", userRouter);

server.listen(8000, () => {
  console.log("server started at port 8000");
});
