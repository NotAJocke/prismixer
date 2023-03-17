import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "fs";
import { join } from "path";

function isPrismaInitiated(): boolean {
  return existsSync(join(process.cwd(), "prisma"));
}

function isInitiated(): boolean {
  return existsSync(join(process.cwd(), "prisma", "models"));
}

function isPrismaImportInstalled(): boolean {
  return existsSync(join(process.cwd(), "node_modules", ".bin", "prisma-import"));
}

function areModels(): boolean {
  const modelsFolder = join(process.cwd(), "prisma", "models");

  try {
    const files = readdirSync(modelsFolder);
    return files.length > 1;
  } catch(_) {
    return false;
  }
}

export function ensureTempFileDeleted(): void {
  if(existsSync(join(process.cwd(), "prisma", "temp.prisma"))) {
    rmSync(join(process.cwd(), "prisma", "temp.prisma"));
  }
}

export function isReady() {
  if(!isPrismaInitiated()) {
    throw new Error(`Prisma is not initiated. Please run 'npx prisma init' first.`);
  }
  if(!isInitiated()) {
    throw new Error(`Prismixer is not initiated. Please run 'npx prismixer init' first.`);
  }
  if(!isPrismaImportInstalled()) {
    throw new Error(`Prisma Import is not installed. Please install it with 'npm i prisma-import'.`);
  }
  if(!areModels()) {
    throw new Error(`No models found. Please create at least one model in 'prisma/models'.`);
  }
  ensureTempFileDeleted();
}

export function initPrismixer() {

  const prismaFolder = join(process.cwd(), "prisma");

  if(!isPrismaInitiated()) {
    throw new Error(`Prisma is not initiated. Please run 'npx prisma init' first.`);
  }

  if(!existsSync(join(prismaFolder, "models"))) {
    mkdirSync(join(prismaFolder, "models"));
  }

  if(existsSync(join(prismaFolder, "schema.prisma"))) {
    const baseFilePath = join(prismaFolder, "models", "base.prisma");
    renameSync(join(prismaFolder, "schema.prisma"), baseFilePath);
  }
}