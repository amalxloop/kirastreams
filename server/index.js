require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const commentRoutes = require("./routes/comments");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "KiraStreams API" }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/comments", commentRoutes);

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI env var");
  }
  try {
    if (uri) {
      await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "kirastreams" });
      console.log("MongoDB connected");
    }
  } catch (err) {
    console.error("MongoDB connection error", err);
  }
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

start();