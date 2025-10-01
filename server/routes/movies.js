const express = require("express");
const jwt = require("jsonwebtoken");
const Movie = require("../models/Movie");

const router = express.Router();

function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/", async (req, res) => {
  try {
    const { q, genre, year, sort } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: String(q), $options: "i" };
    if (genre) filter.genre = String(genre);
    if (year) filter.year = Number(year);
    let cursor = Movie.find(filter);
    if (sort === "rating") cursor = cursor.sort({ rating: -1 });
    if (sort === "new") cursor = cursor.sort({ year: -1 });
    const list = await cursor.limit(100);
    res.json(list);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const created = await Movie.create(req.body);
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Invalid payload" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const m = await Movie.findById(req.params.id);
    if (!m) return res.status(404).json({ error: "Not found" });
    res.json(m);
  } catch (e) {
    res.status(404).json({ error: "Not found" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(404).json({ error: "Not found" });
  }
});

module.exports = router;