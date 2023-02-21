import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import constants from "../constants";
import { Model, Datasource, Generator, Enum } from "./models";
import { ensureInitiated, ensureModelsCreated, ensurePrismaImportInstalled, ensureTempFileDeleted, prismaImport } from "./preprocess";
import { formatPrismaFile, deleteTempFile, generatePrismaClient } from "./postprocess";

export async function run() {

  // Preprocess
  await ensureInitiated();
  await ensurePrismaImportInstalled();
  await ensureModelsCreated();
  await ensureTempFileDeleted();
  await prismaImport();

  let schema = await loadFile(constants.tempMergeFilename);
  let data = await cleanFile(schema) as string[];
  let datasource = await getDatasource(data);
  let generator = await getGenerator(data)
  let { models, enums } = await parseSchema(data);
  models = await mergeModels(models);
  if(enums.length > 0) {
    enums = await mergeEnums(enums);
  }
  await generateFile(datasource as Datasource, generator as Generator, models, enums);

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

export async function parseSchema(schema: string[]) {
  let models: Model[] = [];
  let enums: Enum[] = [];

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

    if(schema[line]?.startsWith("enum")) {
      let enumSchema: Enum = {
        name: schema[line].split(" ")[1],
        props: []
      }

      for(let i = parseInt(line) + 1; i < schema.length; i++) {
          
          if(schema[i]?.startsWith("}")) {
            enums.push(enumSchema);
            break;
          } else {
  
            let line = schema[i].trim().split(" ")
            let prop = line[0];
  
            enumSchema.props?.push({
              name: prop
            });
          }
        }
    }
  }

  return { models, enums };
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

export async function mergeEnums(enums: Enum[]) {

  let mergedEnums: Enum[] = [];

  for(let enumSchema of enums) {
      
    let existingEnum = mergedEnums.find((e) => e.name === enumSchema.name);

    if(existingEnum) {
      for(let prop of enumSchema.props) {
        if(!existingEnum.props.find((p) => p.name === prop.name)) {
          existingEnum.props.push(prop);
        }
      }
    } else {
      mergedEnums.push(enumSchema);
    }
  }

  return mergedEnums;
}

export async function generateFile(datasource: Datasource, generator: Generator, models: Model[], enums: Enum[]) {
  
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

  for(let enumSchema of enums) {
    file += `

    enum ${enumSchema.name} {
    ${enumSchema.props.map((p) => {
      return `\t${p.name}`
    }
    ).join("\n")}
    }`;
  }

  writeFileSync(join(process.cwd(), "prisma", `${constants.finalFilename}.prisma`), file, { encoding: 'utf-8' });
}
