// utils/storage.js
const fs = require("fs");
const path = require("path");
const { DATA_DIR, ensureDataFiles } = require("./dataDir");

ensureDataFiles();

// Load JSON file → always returns an array or object
function load(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data || "[]");
    } catch (err) {
        console.error("Error loading", fileName, err);
        return [];
    }
}

// Save array/object to JSON file
function save(fileName, data) {
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = { load, save };
