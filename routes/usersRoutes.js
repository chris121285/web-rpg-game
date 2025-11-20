const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const router = express.Router();
const { DATA_DIR, ensureDataFiles } = require("../utils/dataDir");

ensureDataFiles();
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Helper to read file
function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

// Helper to write
function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), "utf8");
}

function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password = "") {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasLength && hasUpper && hasSpecial;
}

// ---------------------------------------------------
// POST /users/register
// ---------------------------------------------------
router.post("/register", (req, res) => {
  const { email, username, password } = req.body;
  const normalizedEmail = (email || "").trim().toLowerCase();
  const handle = (username || "").trim();

  if (!normalizedEmail || !password)
    return res.status(400).json({ error: "Email and password are required" });

  if (!isValidEmail(normalizedEmail))
    return res.status(400).json({ error: "Invalid email address" });

  if (!isStrongPassword(password))
    return res.status(400).json({ error: "Password does not meet requirements" });

  const finalHandle = handle || normalizedEmail.split("@")[0];

  const users = readUsers();

  if (users.find(u => (u.email || "").toLowerCase() === normalizedEmail))
    return res.status(400).json({ error: "Email already registered" });

  if (users.find(u => (u.username || "").toLowerCase() === finalHandle.toLowerCase()))
    return res.status(400).json({ error: "Handle already taken" });

  const hashed = bcrypt.hashSync(password, 10);

  const newUser = {
    id: users.length + 1,
    username: finalHandle,
    email: normalizedEmail,
    password: hashed
  };

  users.push(newUser);
  writeUsers(users);

  res.json({
    success: true,
    user: { id: newUser.id, username: newUser.username, email: newUser.email }
  });
});

// ---------------------------------------------------
// POST /users/login
// ---------------------------------------------------
router.post("/login", (req, res) => {
  const { email, username, password } = req.body;
  const identifier = (email || username || "").trim().toLowerCase();

  if (!identifier || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const users = readUsers();
  const user = users.find(u => {
    const storedEmail = (u.email || "").toLowerCase();
    const storedUsername = (u.username || "").toLowerCase();
    return storedEmail === identifier || storedUsername === identifier;
  });

  if (!user)
    return res.status(400).json({ error: "Invalid email/password" });

  const match = bcrypt.compareSync(password, user.password);
  if (!match)
    return res.status(400).json({ error: "Invalid email/password" });

  res.json({
    success: true,
    user: { id: user.id, username: user.username, email: user.email || user.username }
  });
});

// ---------------------------------------------------
// POST /users/recover
// ---------------------------------------------------
router.post("/recover", (req, res) => {
  const { email } = req.body;
  const identifier = (email || "").trim().toLowerCase();

  if (!identifier)
    return res.status(400).json({ error: "Email is required" });

  const users = readUsers();
  const userExists = users.some(u => {
    const storedEmail = (u.email || "").toLowerCase();
    const storedUsername = (u.username || "").toLowerCase();
    return storedEmail === identifier || storedUsername === identifier;
  });

  // Respond generically to avoid leaking which emails exist
  res.json({
    success: true,
    message: userExists
      ? "Recovery instructions have been sent if this email belongs to a guild member."
      : "If this email belongs to a guild member, recovery instructions will arrive shortly."
  });
});

module.exports = router;
