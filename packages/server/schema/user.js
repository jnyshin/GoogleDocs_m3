import mongoose from "mongoose";

const user = new mongoose.Schema({
  _id: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  enable: Boolean,
  key: String,
});

export default mongoose.model("User", user);
