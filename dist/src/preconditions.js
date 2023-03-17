"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPrismixer = exports.isReady = exports.ensureTempFileDeleted = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
function isPrismaInitiated() {
    return (0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma"));
}
function isInitiated() {
    return (0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", "models"));
}
function isPrismaImportInstalled() {
    return (0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "node_modules", ".bin", "prisma-import"));
}
function areModels() {
    const modelsFolder = (0, path_1.join)(process.cwd(), "prisma", "models");
    try {
        const files = (0, fs_1.readdirSync)(modelsFolder);
        return files.length > 1;
    }
    catch (_) {
        return false;
    }
}
function ensureTempFileDeleted() {
    if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", "temp.prisma"))) {
        (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", "temp.prisma"));
    }
}
exports.ensureTempFileDeleted = ensureTempFileDeleted;
function isReady() {
    if (!isPrismaInitiated()) {
        throw new Error(`Prisma is not initiated. Please run 'npx prisma init' first.`);
    }
    if (!isInitiated()) {
        throw new Error(`Prismixer is not initiated. Please run 'npx prismixer init' first.`);
    }
    if (!isPrismaImportInstalled()) {
        throw new Error(`Prisma Import is not installed. Please install it with 'npm i prisma-import'.`);
    }
    if (!areModels()) {
        throw new Error(`No models found. Please create at least one model in 'prisma/models'.`);
    }
    ensureTempFileDeleted();
}
exports.isReady = isReady;
function initPrismixer() {
    const prismaFolder = (0, path_1.join)(process.cwd(), "prisma");
    if (!isPrismaInitiated()) {
        throw new Error(`Prisma is not initiated. Please run 'npx prisma init' first.`);
    }
    if (!(0, fs_1.existsSync)((0, path_1.join)(prismaFolder, "models"))) {
        (0, fs_1.mkdirSync)((0, path_1.join)(prismaFolder, "models"));
    }
    if ((0, fs_1.existsSync)((0, path_1.join)(prismaFolder, "schema.prisma"))) {
        const baseFilePath = (0, path_1.join)(prismaFolder, "models", "base.prisma");
        (0, fs_1.renameSync)((0, path_1.join)(prismaFolder, "schema.prisma"), baseFilePath);
    }
}
exports.initPrismixer = initPrismixer;
