const fs = require("fs");
const path = require("path");

const LOCAL_DATA_DIR = path.join(__dirname, "..", "data");
const RENDER_DATA_DIR = path.join("/data", "rpg");

function resolveDataDir() {
  if (process.env.DATA_DIR) {
    return path.resolve(process.env.DATA_DIR);
  }

  if (process.env.RENDER || process.env.RENDER_EXTERNAL_URL || fs.existsSync("/data")) {
    return RENDER_DATA_DIR;
  }

  return LOCAL_DATA_DIR;
}

const DATA_DIR = resolveDataDir();

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created data folder at ${DATA_DIR}`);
  }

  const files = [
    "users.json",
    "campaigns.json",
    "players.json",
    "npcs.json",
    "encounters.json"
  ];

  files.forEach(file => {
    const fullPath = path.join(DATA_DIR, file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify([], null, 2), "utf8");
      console.log(`📄 Created ${file}`);
    }
  });
}

module.exports = { DATA_DIR, ensureDataFiles };
