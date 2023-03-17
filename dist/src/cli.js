"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const fs_1 = require("fs");
const nanospinner_1 = require("nanospinner");
const path_1 = require("path");
const main_1 = require("./main");
const preconditions_1 = require("./preconditions");
const utils_1 = require("./utils");
async function main() {
    const args = process.argv.slice(2);
    switch (args[0]) {
        case "run": {
            /*
            
            You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
            ```
            import { PrismaClient } from './prisma/dist/client'
            const prisma = new PrismaClient()
            ```
            
            */
            let spinner = (0, nanospinner_1.createSpinner)("Running Prismixer...").start();
            try {
                const start = Date.now();
                (0, preconditions_1.isReady)();
                (0, main_1.runPrismaImport)();
                let { models, enums, datasource, generator } = (0, main_1.parseSchema)();
                models = (0, main_1.mergeModels)(models);
                if (enums.length > 0) {
                    enums = (0, main_1.mergeEnums)(enums);
                }
                const schema = (0, main_1.generateSchema)(datasource, generator, models, enums);
                (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), "prisma", "schema.prisma"), schema, { encoding: 'utf-8' });
                spinner.success({ text: "Prismixer ran successfully!" });
                (0, utils_1.deleteTempFile)();
                spinner = (0, nanospinner_1.createSpinner)("Formatting Prisma file...").start();
                await (0, utils_1.formatPrismaFile)((0, path_1.join)(process.cwd(), "prisma", "schema.prisma"));
                spinner.success({ text: "Prisma file formatted successfully!" });
                spinner = (0, nanospinner_1.createSpinner)("Generating Prisma client...").start();
                const outputPath = await (0, utils_1.generatePrismaClient)((0, path_1.join)(process.cwd(), "prisma", "schema.prisma"));
                spinner.success({ text: "Prisma client generated successfully!" });
                const end = Date.now();
                console.log(`Ran Prismixer in ${end - start}ms 🚀.`);
                if (args[1] == "--output-client" || args[1] == "-o") {
                    const output = `
You can now start using Prisma Client in your code. Reference: https://pris.ly/d/client
\`\`\`
\x1b[36mimport\x1b[0m \x1b[90m{\x1b[0m PrismaClient \x1b[90m}\x1b[0m \x1b[36mfrom\x1b[0m \x1b[90m'${outputPath}'\x1b[0m
\x1b[36mconst\x1b[0m prisma = \x1b[36mnew\x1b[0m PrismaClient()
\`\`\`
          `;
                    console.log(output);
                }
            }
            catch (err) {
                spinner.error({ text: err });
            }
            break;
        }
        case "init": {
            const spinner = (0, nanospinner_1.createSpinner)("Initializing Prismixer...");
            spinner.start();
            try {
                (0, preconditions_1.initPrismixer)();
                spinner.success({ text: "Prismixer initialized." });
            }
            catch (err) {
                spinner.error({ text: err });
            }
            break;
        }
        case "clean": {
            (0, preconditions_1.ensureTempFileDeleted)();
            if ((0, fs_1.existsSync)((0, path_1.join)(process.cwd(), "prisma", "schema.prisma"))) {
                (0, fs_1.rmSync)((0, path_1.join)(process.cwd(), "prisma", "schema.prisma"));
            }
            (0, nanospinner_1.createSpinner)().success({ text: "Build file removed." });
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
exports.main = main;
