// this is for setting the DB structure
import mongoose from "mongoose";

const instance = mongoose.Schema({
  caption: String,
  user: String,
  image: String,
  comments: [],
});

export default mongoose.model("posts", instance);
