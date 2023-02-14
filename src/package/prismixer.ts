import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import constants from "../constants";
import { Model, Datasource, Generator } from "./models";
import { ensureInitiated, ensurePrismaImportInstalled, ensureTempFileDeleted, prismaImport } from "./preprocess";
import { formatPrismaFile, deleteTempFile, generatePrismaClient } from "./postprocess";

export async function run() {

  // Preprocess
  try {
    await ensurePrismaImportInstalled()
  } catch(_) {
    return console.error("Prisma Import is not installed. Please install it with 'npm i -g prisma-import'.")
  }
  await ensureInitiated()
    .catch(console.error);
  await ensureTempFileDeleted();
  await prismaImport();

  let schema = await loadFile(constants.tempMergeFilename);
  let data = await cleanFile(schema) as string[];
  let datasource = await getDatasource(data);
  let generator = await getGenerator(data)
  let models = await parseModels(data);
  models = await mergeModels(models);
  await generateFile(datasource as Datasource, generator as Generator, models);

  // Postprocess
  await formatPrismaFile()
  await deleteTempFile();
  await generatePrismaClient();
}

export async function cleanFile(schema: string) {
  return schema.split("\n").map((l) => {
    if(!l.startsWith("//")) {
      return l.replace(/\s\s+/g, ' ');
    }
  }).filter((l) => l !== undefined && l !== "");
}

export async function loadFile(filename: string) {
  return readFileSync(join(process.cwd(), "prisma", `${filename}.prisma`), { encoding: 'utf-8' });
}

export async function parseModels(schema: string[]) {
  let models: Model[] = [];

  for(let line in schema) {

    if(schema[line]?.startsWith("model")) {
      let model: Model = {
        name: schema[line].split(" ")[1],
        props: []
      }

      for(let i = parseInt(line) + 1; i < schema.length; i++) {

        if(schema[i]?.startsWith("}")) {
          models.push(model);
          break;
        } else {

          let line = schema[i].trim().split(" ")
          let prop = line[0];
          let type = line[1];
          let args;
          if(line.length > 2) {
            args = line.slice(2);
          }

          model.props?.push({
            name: prop,
            type: type,
            args: args ?? []
          });
        }
      }
    }
  }

  return models;
}

export async function getDatasource(schema: string[]) {
  for(let line in schema) {
    if(schema[line]?.startsWith("datasource")) {
      let datasourceName = schema[line].split(" ")[1];
      let provider;
      let url;

      for(let i = parseInt(line) + 1; i < schema.length; i++) {
        if(schema[i]?.startsWith("}")) {
          let datasource: Datasource = {
            name: datasourceName,
            provider: provider ?? "",
            url: url ?? ""
          }
          return datasource;
        } else {
          let line = schema[i].trim().split("=").map((l) => l.trim());

          if(line[0] == "provider") {
            provider = line[1];
          }
          else if(line[0] == "url") {
            url = line[1];
          }
        }
      }
    }
  }
}

export async function getGenerator(schema: string[]) {
  for(let line in schema) {
    if(schema[line]?.startsWith("generator")) {
      let generatorName = schema[line].split(" ")[1];
      let provider;
      let output;

      for(let i = parseInt(line) + 1; i < schema.length; i++) {
        if(schema[i]?.startsWith("}")) {
          let generator: Generator = {
            name: generatorName,
            provider: provider ?? "",
            output: output
          }
          return generator;
        } else {
          let line = schema[i].trim().split("=").map((l) => l.trim());

          if(line[0] == "provider") {
            provider = line[1];
          }
          else if(line[0] == "output") {
            output = line[1];
          }
        }
      }
    }
  }
}

export async function mergeModels(models: Model[]) {

  let mergedModels: Model[] = [];

  for(let model of models) {
      
    let existingModel = mergedModels.find((m) => m.name === model.name);

    if(existingModel) {
      for(let prop of model.props) {
        if(!existingModel.props.find((p) => p.name === prop.name)) {
          existingModel.props.push(prop);
        }
      }
    } else {
      mergedModels.push(model);
    }
  }

  return mergedModels;
}

export async function generateFile(datasource: Datasource, generator: Generator, models: Model[]) {
  
  let file = `
  datasource ${datasource.name} {
    provider = ${datasource.provider}
    url      = ${datasource.url}
  }

  generator ${generator.name} {
    provider = ${generator.provider}
    ${generator.output ? `output = ${generator.output}` : ""}
  }
  `;

  for(let model of models) {
    file += `

    model ${model.name} {
    ${model.props.map((p) => {
      return `\t${p.name} ${p.type} ${p.args ? p.args.join(" ") : ""}`
    }
    ).join("\n")}
    }`;
  }

  writeFileSync(join(process.cwd(), "prisma", `${constants.finalFilename}.prisma`), file, { encoding: 'utf-8' });
}
