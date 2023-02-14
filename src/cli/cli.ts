import { createSpinner } from "nanospinner";

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
    }
  }
}