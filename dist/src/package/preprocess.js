"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPrismixer = exports.prismaImport = exports.ensureInitiated = exports.ensurePrismaImportInstalled = exports.ensureModelsCreated = exports.ensureTempFileDeleted = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const constants_1 = __importDefault(require("../constants"));
const path_1 = require("path");
const userPreferences_1 = require("../userPreferences");
async function ensureTempFileDeleted() {
    if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", constants_1.default.tempMergeFilename + ".prisma"))) {
        (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", constants_1.default.tempMergeFilename + ".prisma"));
    }
}
exports.ensureTempFileDeleted = ensureTempFileDeleted;
async function ensureModelsCreated() {
    return new Promise((resolve, reject) => {
        let prismaFolder = (0, path_1.join)(process.cwd(), "prisma");
        try {
            let files = (0, fs_1.readdirSync)((0, path_1.join)(prismaFolder, "models"));
            if (files.length <= 1) {
                throw new Error("No models found. Please create at least one model in 'prisma/models'.");
            }
            else {
                resolve();
            }
        }
        catch (_) {
            throw new Error("No models found. Please create at least one model in 'prisma/models'.");
        }
    });
}
exports.ensureModelsCreated = ensureModelsCreated;
async function ensurePrismaImportInstalled() {
    return new Promise((resolve, reject) => {
        let cmd = `npx prisma-import --help`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                throw new Error("Prisma Import is not installed. Please install it with 'npm i -g prisma-import'.");
            }
            return resolve();
        });
    });
}
exports.ensurePrismaImportInstalled = ensurePrismaImportInstalled;
async function ensureInitiated() {
    return new Promise((resolve, reject) => {
        if (!(0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma"))) {
            throw new Error("Prisma is not initiated. Please run 'npx prisma init' first.");
        }
        else if (!(0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", "models"))) {
            throw new Error("Prismixer is not initiated. Please run 'npx prismixer init' first.");
        }
        else if ((0, userPreferences_1.getUserPreferences)() == null || (0, userPreferences_1.getUserPreferences)()?.packageManager == null) {
            throw new Error("No package manager found. Please run 'npx prismixer init' first.");
        }
        else {
            resolve();
        }
    });
}
exports.ensureInitiated = ensureInitiated;
async function prismaImport() {
    return new Promise((resolve, reject) => {
        let cmd = `npx prisma-import --schemas 'prisma/models/*.prisma' --output 'prisma/${constants_1.default.tempMergeFilename}.prisma'`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                console.log(err);
            }
            return resolve(true);
        });
    });
}
exports.prismaImport = prismaImport;
async function initPrismixer(packageManager) {
    (0, userPreferences_1.setUserPreferences)({ packageManager: packageManager });
    let prismaFolder = (0, path_1.join)(process.cwd(), "prisma");
    // Remove prisma file
    if ((0, fs_1.existsSync)((0, path_1.join)(prismaFolder, "schema.prisma"))) {
        (0, fs_1.rmSync)((0, path_1.join)(prismaFolder, "schema.prisma"));
    }
    // Create models folder
    if (!(0, fs_1.existsSync)((0, path_1.join)(prismaFolder, "models"))) {
        (0, fs_1.mkdirSync)((0, path_1.join)(prismaFolder, "models"));
    }
    // create base file
    let baseFilepath = (0, path_1.join)(prismaFolder, "models", "base.prisma");
    let data = `
  datasource db {
    provider = "mongodb"
    url      = "mongodb://localhost:27017/test"
  }
  
  generator client {
    provider = "prisma-client-js"
  }
  `;
    if (!(0, fs_1.existsSync)(baseFilepath)) {
        (0, fs_1.writeFileSync)(baseFilepath, data, { encoding: "utf-8" });
    }
    let cmd = `npx prisma format --schema ${(0, path_1.join)(process.cwd(), "prisma", "models", "base.prisma")}`;
    (0, child_process_1.exec)(cmd, (err) => {
        if (err) {
            console.error(err);
        }
    });
}
exports.initPrismixer = initPrismixer;
