"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTempFile = exports.cleanFile = exports.generatePrismaClient = exports.formatPrismaFile = void 0;
const internals_1 = require("@prisma/internals");
const fs_1 = require("fs");
const path_1 = require("path");
async function formatPrismaFile(path) {
    const output = await (0, internals_1.formatSchema)({
        schemaPath: path,
    });
    (0, fs_1.writeFileSync)(path, output, "utf-8");
}
exports.formatPrismaFile = formatPrismaFile;
async function generatePrismaClient(path) {
    const generator = await (0, internals_1.getGenerator)({
        schemaPath: path,
        dataProxy: false,
    });
    await generator.generate();
    generator.stop();
    if (generator.config.isCustomOutput) {
        return `./${(0, path_1.relative)(process.cwd(), generator.config.output.value)}` ?? "@prisma/client";
    }
    return "@prisma/client";
}
exports.generatePrismaClient = generatePrismaClient;
function cleanFile(schema) {
    return schema.split("\n").map((l) => {
        if (!l.startsWith("//")) {
            return l.replace(/\s\s+/g, ' ');
        }
    }).filter((l) => l !== undefined && l !== "");
}
exports.cleanFile = cleanFile;
function deleteTempFile() {
    (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", "temp.prisma"));
}
exports.deleteTempFile = deleteTempFile;
