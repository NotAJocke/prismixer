import { exec } from "child_process";
import { rmSync } from "fs";
import { join } from "path";

import constants from "../constants";
import { getPackageManagerExecuter } from "../utils";

export async function formatPrismaFile(): Promise<void> {
  return new Promise((resolve, reject) => {
    const executer = getPackageManagerExecuter();
    let cmd = `${executer} prisma format --schema ${join(process.cwd(), "prisma", `${constants.finalFilename}.prisma`)}`;
    exec(cmd, (err) => {
      if(err) {
        console.log(err);
      }
      return resolve();
    });
  })
}

export async function deleteTempFile(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      rmSync(join(process.cwd(), "prisma", `${constants.tempMergeFilename}.prisma`));
      return resolve();
    } catch (err: any) {
      throw new Error(err);
    }
  });
}

export async function generatePrismaClient(): Promise<void> {
  return new Promise((resolve, reject) => {
    const executer = getPackageManagerExecuter();
    let cmd = `${executer} prisma generate`;
    exec(cmd, (err) => {
      if(err) {
        console.log(err);
      }
      return resolve();
    });
  });
}