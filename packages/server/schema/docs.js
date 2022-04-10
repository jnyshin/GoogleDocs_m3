import mongoose from "mongoose";
const docs = new mongoose.Schema({
  _id: String,
  data: Object,
});
export default mongoose.model("Docs", docs); //= mongoose.model("Conn", conn);
