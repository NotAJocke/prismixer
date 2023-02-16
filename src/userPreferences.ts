import { join } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { UserPreferences } from "./package/models";

export function getUserPreferences(): UserPreferences {
  const fileUrl = join(process.cwd(), "package.json");
  
  if (!existsSync(fileUrl)) {
    throw new Error("package.json not found");
  }
  
  const file = readFileSync(fileUrl, "utf8");
  const json = JSON.parse(file);
  return json.prismixer;
}

export function setUserPreferences(data: any) {
  const fileUrl = join(process.cwd(), "package.json");

  if (!existsSync(fileUrl)) {
    throw new Error("package.json not found");
  }

  const file = readFileSync(fileUrl, "utf8");
  const json = JSON.parse(file);

  json.prismixer = data;

  const newFile = JSON.stringify(json, null, 2);

  writeFileSync(fileUrl, newFile, "utf8");

  return true;
}