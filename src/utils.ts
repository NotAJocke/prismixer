import { formatSchema, getGenerator } from "@prisma/internals";
import { rmSync, writeFileSync } from "fs";
import { join, relative } from "path";

export async function formatPrismaFile(path: string) {
  const output = await formatSchema({
    schemaPath: path,
  });

  writeFileSync(path, output, "utf-8");
}

export async function generatePrismaClient(path: string): Promise<string> {
  const generator = await getGenerator({
    schemaPath: path,
    dataProxy: false,
  });
  await generator.generate();
  generator.stop();

  if (generator.config.isCustomOutput) {
    return `./${relative(process.cwd(), generator.config.output!.value!)}` ?? "@prisma/client";
  }

  return "@prisma/client";
}

export function cleanFile(schema: string) {
  return schema.split("\n").map((l) => {
    if(!l.startsWith("//")) {
      return l.replace(/\s\s+/g, ' ');
    }
  }).filter((l) => l !== undefined && l !== "");
}

export function deleteTempFile() {
  rmSync(join(process.cwd(), "prisma", "temp.prisma"));
}