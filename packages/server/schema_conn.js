import mongoose from "mongoose";
const conn = new mongoose.Schema({
  _id: String,
  data: Object,
  doc: String,
});
export default mongoose.model("Conn", conn); //= mongoose.model("Conn", conn);
