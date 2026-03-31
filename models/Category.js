import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: String,
});

export default mongoose.models.Categories ||
  mongoose.model("Categories", categorySchema);
