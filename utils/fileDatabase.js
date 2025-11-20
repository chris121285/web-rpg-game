const fs = require("fs");
const path = require("path");
const { DATA_DIR, ensureDataFiles } = require("./dataDir");

ensureDataFiles();

function filePath(name) {
    return path.join(DATA_DIR, name);
}

function readJSON(file) {
    const p = filePath(file);
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p);
    return JSON.parse(raw);
}

function writeJSON(file, data) {
    const p = filePath(file);
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
