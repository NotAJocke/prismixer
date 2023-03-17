import { existsSync, rmSync, writeFileSync } from "fs";
import { createSpinner } from "nanospinner";
import { join } from "path";

import { generateSchema, mergeEnums, mergeModels, parseSchema, runPrismaImport } from "./main";
import { Datasource, Generator } from "./models";
import { ensureTempFileDeleted, initPrismixer, isReady } from "./preconditions";
import { deleteTempFile, formatPrismaFile, generatePrismaClient } from "./utils";

export async function main() {
  
  const args = process.argv.slice(2);

  switch(args[0]) {

    case "run": {

      /*
      
      You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
      ```
      import { PrismaClient } from './prisma/dist/client'
      const prisma = new PrismaClient()
      ```
      
      */
      let spinner = createSpinner("Running Prismixer...").start();
      try {
        const start = Date.now();
        isReady();
        runPrismaImport();
        let { models, enums, datasource, generator } = parseSchema();
        models = mergeModels(models);
        if(enums.length > 0) {
          enums = mergeEnums(enums);
        }
        const schema = generateSchema(datasource as Datasource, generator as Generator, models, enums);
        writeFileSync(join(process.cwd(), "prisma", "schema.prisma"), schema, { encoding: 'utf-8' });
        spinner.success({ text: "Prismixer ran successfully!" });

        deleteTempFile();

        spinner = createSpinner("Formatting Prisma file...").start();
        await formatPrismaFile(join(process.cwd(), "prisma", "schema.prisma"));
        spinner.success({ text: "Prisma file formatted successfully!" });

        spinner = createSpinner("Generating Prisma client...").start();
        const outputPath = await generatePrismaClient(join(process.cwd(), "prisma", "schema.prisma"));
        spinner.success({ text: "Prisma client generated successfully!" });

        const end = Date.now();
        console.log(`Ran Prismixer in ${end - start}ms 🚀.`)

        if (args[1] == "--output-client" || args[1] == "-o") {
          const output = `
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
\`\`\`
\x1b[36mimport\x1b[0m \x1b[90m{\x1b[0m PrismaClient \x1b[90m}\x1b[0m \x1b[36mfrom\x1b[0m \x1b[90m'${outputPath}'\x1b[0m
\x1b[36mconst\x1b[0m prisma = \x1b[36mnew\x1b[0m PrismaClient()
\`\`\`
          `;
          console.log(output)
        }

      } catch(err: any) {
        spinner.error({ text: err });
      }

      break;
    }

    case "init": {
      const spinner = createSpinner("Initializing Prismixer...");
      spinner.start();
      try {
        initPrismixer();
        spinner.success({ text: "Prismixer initialized." });
      } catch(err: any) {
        spinner.error({ text: err });
      }
      break;
    }

    case "clean": {
      ensureTempFileDeleted();
      if(existsSync(join(process.cwd(), "prisma", "schema.prisma"))) {
        rmSync(join(process.cwd(), "prisma", "schema.prisma"));
      }
      createSpinner().success({ text: "Build file removed." })
      break;
    }

    case "help":
    default:
      console.log(`
      Usage: prismixer <command>

      Commands:
        run     Runs Prismixer
        init    Initializes Prismixer
        clean   Removes build file
        help    Displays this message
      `);
      break;
  }
}
