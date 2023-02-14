"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaImport = exports.ensureInitiated = exports.ensurePrismaImportInstalled = exports.ensureTempFileDeleted = void 0;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const constants_1 = __importDefault(require("../constants"));
const path_1 = require("path");
async function ensureTempFileDeleted() {
    if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", constants_1.default.tempMergeFilename + ".prisma"))) {
        (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", constants_1.default.tempMergeFilename + ".prisma"));
    }
}
exports.ensureTempFileDeleted = ensureTempFileDeleted;
async function ensurePrismaImportInstalled() {
    return new Promise((resolve, reject) => {
        let cmd = `npx prisma-import --help`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                console.log(err);
                return reject();
            }
            return resolve();
        });
    });
}
exports.ensurePrismaImportInstalled = ensurePrismaImportInstalled;
async function ensureInitiated() {
    return new Promise((resolve, reject) => {
        if (!(0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma"))) {
            reject("Prisma is not initiated. Please run 'npx prisma init' first.");
        }
        else if (!(0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", "models"))) {
            reject("Prismixer is not initiated. Please run 'npx prismixer init' first.");
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
