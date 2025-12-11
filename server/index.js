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

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function start() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("Missing MONGODB_URI env var");
    } else {
      await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "kirastreams" });
      console.log("MongoDB connected");
    }

    await nextApp.prepare();

    app.use(cors());
    app.use(express.json());

    app.get("/api/health", (_req, res) => res.json({ ok: true, name: "KiraStreams API" }));

    app.use("/api/auth", authRoutes);
    app.use("/api/movies", movieRoutes);
    app.use("/api/comments", commentRoutes);

    // Handle all other routes with Next.js
    app.all("*", (req, res) => {
      return handle(req, res);
    });

    app.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
}

start();