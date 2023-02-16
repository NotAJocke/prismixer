import { exec } from "child_process";
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
    let cmd = `rm ${join(process.cwd(), "prisma", `${constants.tempMergeFilename}.prisma`)}`;
    exec(cmd, (err) => {
      if(err) {
        console.log(err);
      }
      return resolve();
    });
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