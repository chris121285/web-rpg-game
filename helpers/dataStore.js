// helpers/dataStore.js
const fs = require("fs");
const path = require("path");
const { DATA_DIR, ensureDataFiles } = require("../utils/dataDir");

ensureDataFiles();
const basePath = DATA_DIR;

function filePath(filename) {
    return path.join(basePath, filename);
}

// Ensure file exists
function ensureFile(filename, defaultData) {
    const fullPath = filePath(filename);
    if (!fs.existsSync(fullPath)) {
        fs.writeFileSync(fullPath, JSON.stringify(defaultData, null, 2));
    }
}

function load(filename) {
    ensureFile(filename, []);
    const raw = fs.readFileSync(filePath(filename));
    return JSON.parse(raw);
}

function save(filename, data) {
    fs.writeFileSync(filePath(filename), JSON.stringify(data, null, 2));
}

module.exports = { load, save };
