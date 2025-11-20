const express = require("express");
const router = express.Router();
const { getClassLevelData } = require("../utils/dndLevels");

function normalizeClassKey(value = "") {
  return value
    .replace(/\(.*?\)/g, "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0];
}

router.get("/class/:className/:level", (req, res) => {
  const classKey = normalizeClassKey(req.params.className || "");
  const level = parseInt(req.params.level, 10);

  if (!classKey || Number.isNaN(level) || level < 1 || level > 20) {
    return res.status(400).json({ success: false, error: "Invalid class or level" });
  }

  const data = getClassLevelData(classKey, level);
  if (!data) {
    return res.status(404).json({
      success: false,
      error: "Class data not available in DNDOPEN reference"
    });
  }

  res.json({
    success: true,
    class: classKey,
    level,
    progression: data
  });
});

module.exports = router;
