const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    rating: { type: Number, default: 0 },
    description: { type: String },
    thumbnail: { type: String },
    banner: { type: String },
    videoUrl: { type: String },
    cast: [{ type: String }],
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);