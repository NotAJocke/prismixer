import { existsSync, rmSync } from "fs";
import { exec } from "child_process";
import constants from "../constants";
import { join } from "path";

export async function ensureTempFileDeleted() {
  if(existsSync(join(process.cwd(), "prisma", constants.tempMergeFilename + ".prisma"))) {
    rmSync(join(process.cwd(), "prisma", constants.tempMergeFilename + ".prisma"));
  }
}

export async function ensurePrismaImportInstalled(): Promise<void> {
  return new Promise((resolve, reject) => {
    let cmd = `npx prisma-import --help`;
    exec(cmd, (err) => {
      if(err) {
        throw new Error("Prisma Import is not installed. Please install it with 'npm i -g prisma-import'.")
      }
      return resolve();
    });
  })
}

export async function ensureInitiated(): Promise<void> {
  return new Promise((resolve, reject) => {
    if(!existsSync(join(process.cwd(), "prisma"))) {
      throw new Error("Prisma is not initiated. Please run 'npx prisma init' first.");
    }
    else if(!existsSync(join(process.cwd(), "prisma", "models"))) {
      throw new Error("Prismixer is not initiated. Please run 'npx prismixer init' first.");
    }
    else {
      resolve();
    }
  });
}

export async function prismaImport(): Promise<boolean> {

  return new Promise((resolve, reject) => {
    let cmd = `npx prisma-import --schemas 'prisma/models/*.prisma' --output 'prisma/${constants.tempMergeFilename}.prisma'`;
    exec(cmd, (err) => {
      if(err) {
        console.log(err);
      }
      return resolve(true);
    });
  })
}