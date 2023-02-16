"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserPreferences = exports.getUserPreferences = void 0;
const path_1 = require("path");
const fs_1 = require("fs");
function getUserPreferences() {
    const fileUrl = (0, path_1.join)(process.cwd(), "package.json");
    if (!(0, fs_1.existsSync)(fileUrl)) {
        throw new Error("package.json not found");
    }
    const file = (0, fs_1.readFileSync)(fileUrl, "utf8");
    const json = JSON.parse(file);
    return json.prismixer;
}
exports.getUserPreferences = getUserPreferences;
function setUserPreferences(data) {
    const fileUrl = (0, path_1.join)(process.cwd(), "package.json");
    if (!(0, fs_1.existsSync)(fileUrl)) {
        throw new Error("package.json not found");
    }
    const file = (0, fs_1.readFileSync)(fileUrl, "utf8");
    const json = JSON.parse(file);
    json.prismixer = data;
    const newFile = JSON.stringify(json, null, 2);
    (0, fs_1.writeFileSync)(fileUrl, newFile, "utf8");
    return true;
}
exports.setUserPreferences = setUserPreferences;
