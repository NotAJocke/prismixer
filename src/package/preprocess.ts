import { existsSync, rmSync, mkdirSync, writeFileSync, readdirSync } from "fs";
import { exec } from "child_process";
import constants from "../constants";
import { join } from "path";

export async function ensureTempFileDeleted() {
  if(existsSync(join(process.cwd(), "prisma", constants.tempMergeFilename + ".prisma"))) {
    rmSync(join(process.cwd(), "prisma", constants.tempMergeFilename + ".prisma"));
  }
}

export async function ensureModelsCreated(): Promise<void> {
  return new Promise((resolve, reject) => {
    let prismaFolder = join(process.cwd(), "prisma");

    try {
      let files = readdirSync(join(prismaFolder, "models"));

      if(files.length <= 1) {
        throw new Error("No models found. Please create at least one model in 'prisma/models'.");
      } else {
        resolve();
      }
    } catch(_) {
      throw new Error("No models found. Please create at least one model in 'prisma/models'.");
    }
  });
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

export async function initPrismixer() {
  let prismaFolder = join(process.cwd(), "prisma");

  // Remove prisma file
  if(existsSync(join(prismaFolder, "schema.prisma"))) {
    rmSync(join(prismaFolder, "schema.prisma"));
  }

  // Create models folder
  if(!existsSync(join(prismaFolder, "models"))) {
    mkdirSync(join(prismaFolder, "models"));
  }

  // create base file
  let baseFilepath = join(prismaFolder, "models", "base.prisma");
  let data = `
  datasource db {
    provider = "mongodb"
    url      = "mongodb://localhost:27017/test"
  }
  
  generator client {
    provider = "prisma-client-js"
  }
  `
  if(!existsSync(baseFilepath)) {
    writeFileSync(baseFilepath, data, { encoding: "utf-8" });
  }

  let cmd = `npx prisma format --schema ${join(process.cwd(), "prisma", "models", "base.prisma")}`;
  exec(cmd, (err) => {
    if(err) {
      console.error(err);
    }
  })
}
