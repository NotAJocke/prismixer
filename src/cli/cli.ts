import { createSpinner } from "nanospinner";
import { initPrismixer } from "../package/preprocess";

import { run } from "../package/prismixer";

export async function main() {
  
  const args = process.argv.slice(2);

  switch(args[0]) {
    case "run": {
      let spinner = createSpinner("Running Prismixer...");
      try {
        spinner.start();
        await run();
        spinner.success({ text: "Prismixer ran successfully!" });
        createSpinner().success({ text: "Prisma client generated!" });
      } catch(e) {
        spinner.error({ text: "Prismixer failed to run!" });
        console.error(e);
      }

      break;
    }

    case "init":
      let spinner = createSpinner("Initializing Prismixer...");
      try {
        await initPrismixer()
        spinner.success({ text: "Prismixer initialized!" });
      } catch(e) {
        spinner.error({ text: "Prismixer failed to initialize!" });
        console.error(e);
      }
      break;

    case "help":
    default:
      console.log(`
        Usage: prismixer <command>

        Commands:
          run     Runs Prismixer
          init    Initializes Prismixer
          help    Displays this message
      `);
      break;
  }
}