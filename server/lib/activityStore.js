const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

class ActivityStore {
  constructor({ filePath, maxEntries = 250 }) {
    this.filePath = filePath;
    this.maxEntries = maxEntries;
    this.ensureFile();
  }

  ensureFile() {
    const parentDir = path.dirname(this.filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]\n");
    }
  }

  readAll() {
    this.ensureFile();
    return JSON.parse(fs.readFileSync(this.filePath, "utf8") || "[]");
  }

  writeAll(entries) {
    fs.writeFileSync(this.filePath, `${JSON.stringify(entries, null, 2)}\n`);
  }

  append(entry) {
    const entries = this.readAll();
    const nextEntry = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry,
    };

    entries.unshift(nextEntry);
    this.writeAll(entries.slice(0, this.maxEntries));
    return nextEntry;
  }

  clear() {
    this.writeAll([]);
  }
}

module.exports = {
  ActivityStore,
};
