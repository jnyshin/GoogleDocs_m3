import mongoose from "mongoose";
const images = new mongoose.Schema({
  _id: String,
  file: String,
  mime: String,
});
export default mongoose.model("Images", images);
