// routes/dmRoutes.js
const express = require("express");
const router = express.Router();

let npcs = [
  { id: 1, name: "Elder Rowan", role: "Village Leader" },
  { id: 2, name: "Thorn", role: "Blacksmith" }
];

// GET /dm
router.get("/", (req, res) => {
  res.json(npcs);
});

// POST /dm
router.post("/", (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const newNpc = {
    id: npcs.length + 1,
    name,
    role
  };

  npcs.push(newNpc);
  res.json({ success: true, npc: newNpc });
});

// PUT /dm/:id
router.put("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, role } = req.body;

  const index = npcs.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: "NPC not found" });

  npcs[index] = {
    ...npcs[index],
    name,
    role
  };

  res.json({ success: true, npc: npcs[index] });
});

// DELETE /dm/:id
router.delete("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  npcs = npcs.filter(n => n.id !== id);
  res.json({ success: true });
});

module.exports = router;
