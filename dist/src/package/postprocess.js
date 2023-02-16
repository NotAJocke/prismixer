"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePrismaClient = exports.deleteTempFile = exports.formatPrismaFile = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = __importDefault(require("../constants"));
const utils_1 = require("../utils");
async function formatPrismaFile() {
    return new Promise((resolve, reject) => {
        const executer = (0, utils_1.getPackageManagerExecuter)();
        let cmd = `${executer} prisma format --schema ${(0, path_1.join)(process.cwd(), "prisma", `${constants_1.default.finalFilename}.prisma`)}`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                console.log(err);
            }
            return resolve();
        });
    });
}
exports.formatPrismaFile = formatPrismaFile;
async function deleteTempFile() {
    return new Promise((resolve, reject) => {
        try {
            (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", `${constants_1.default.tempMergeFilename}.prisma`));
            return resolve();
        }
        catch (err) {
            throw new Error(err);
        }
    });
}
exports.deleteTempFile = deleteTempFile;
async function generatePrismaClient() {
    return new Promise((resolve, reject) => {
        const executer = (0, utils_1.getPackageManagerExecuter)();
        let cmd = `${executer} prisma generate`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                console.log(err);
            }
            return resolve();
        });
    });
}
exports.generatePrismaClient = generatePrismaClient;
