const express = require("express");
const jwt = require("jsonwebtoken");
const Comment = require("../models/Comment");

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

router.get("/:movieId", async (req, res) => {
  try {
    const list = await Comment.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/:movieId", requireAuth, async (req, res) => {
  try {
    const created = await Comment.create({ movieId: req.params.movieId, userId: req.user.sub, text: req.body.text });
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: "Invalid payload" });
  }
});

module.exports = router;