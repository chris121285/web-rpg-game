const fs = require("fs");
const path = require("path");
const { DATA_DIR, ensureDataFiles } = require("./utils/dataDir");

ensureDataFiles();
const DATA_PATH = DATA_DIR;

function getFile(fileName) {
    return path.join(DATA_PATH, fileName);
}

function readJSON(fileName) {
    const file = getFile(fileName);

    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]");
    }

    const data = fs.readFileSync(file);
    return JSON.parse(data);
}

function writeJSON(fileName, data) {
    const file = getFile(fileName);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };
