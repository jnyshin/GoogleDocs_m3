import mongoose from "mongoose";
const docs = new mongoose.Schema(
  {
    _id: String,
    id: String,
    // data: Object,
    name: String,
  },
  { timestamps: true }
);
export default mongoose.model("Docs", docs);
