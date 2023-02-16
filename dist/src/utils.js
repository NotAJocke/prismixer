"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageManagerExecuter = exports.getPackageManager = void 0;
const userPreferences_1 = require("./userPreferences");
function getPackageManager() {
    const userPreferences = (0, userPreferences_1.getUserPreferences)();
    return userPreferences.packageManager;
}
exports.getPackageManager = getPackageManager;
function getPackageManagerExecuter() {
    const userPreferences = (0, userPreferences_1.getUserPreferences)();
    switch (userPreferences.packageManager) {
        case "npm":
            return "npx";
        case "pnpm":
            return "pnpm exec";
    }
}
exports.getPackageManagerExecuter = getPackageManagerExecuter;
(0, userPreferences_1.setUserPreferences)({ packageManager: "pnpm" });
console.log(getPackageManagerExecuter());
