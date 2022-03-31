import mongoose from "mongoose";
const conn = new mongoose.Schema({
  id: String,
  body: String,
});
export default mongoose.model("Conn", conn); //= mongoose.model("Conn", conn);
