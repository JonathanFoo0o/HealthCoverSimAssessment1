const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const db = new Database(path.join(__dirname, "healthcoversim.db"));

const initSQL = fs.readFileSync(
    path.join(__dirname, "init.sql"),
    "utf8"
);

db.exec(initSQL);

module.exports = db;