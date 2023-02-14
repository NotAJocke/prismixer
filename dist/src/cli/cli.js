"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const nanospinner_1 = require("nanospinner");
const prismixer_1 = require("../package/prismixer");
async function main() {
    const args = process.argv.slice(2);
    switch (args[0]) {
        case "run": {
            let spinner = (0, nanospinner_1.createSpinner)("Running Prismixer...");
            try {
                spinner.start();
                await (0, prismixer_1.run)();
                spinner.success({ text: "Prismixer ran successfully!" });
                (0, nanospinner_1.createSpinner)().success({ text: "Prisma client generated!" });
            }
            catch (e) {
                spinner.error({ text: "Prismixer failed to run!" });
                console.error(e);
            }
        }
    }
}
exports.main = main;
