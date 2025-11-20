// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const users = require("../models/userModel");

// POST /auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid login" });
  }

  res.json({ success: true, userId: user.id });
});

module.exports = router;
