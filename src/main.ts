import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Datasource, Enum, Model, Generator } from "./models";
import { isReady } from "./preconditions";
import { cleanFile, deleteTempFile, formatPrismaFile, generatePrismaClient } from "./utils";

async function execute() {
  isReady();

  runPrismaImport();

  let { models, enums, datasource, generator } = parseSchema();
  models = mergeModels(models);
  if(enums.length > 0) {
    enums = mergeEnums(enums);
  }
  const schema = generateSchema(datasource as Datasource, generator as Generator, models, enums);

  writeFileSync(join(process.cwd(), "prisma", "schema.prisma"), schema, { encoding: 'utf-8' });
  deleteTempFile();
  await formatPrismaFile(join(process.cwd(), "prisma", "schema.prisma"));
  await generatePrismaClient(join(process.cwd(), "prisma", "schema.prisma"));
}

export function runPrismaImport(){
  const prismaImportCmd = `npx prisma-import --schemas 'prisma/models/*.prisma' --output 'prisma/temp.prisma'`;
  try {
    execSync(prismaImportCmd);
  } catch(e) {
    throw new Error(`Prisma Import failed with error: '${e}'.`);
  }
}

export function parseSchema() {
  const rawSchema = readFileSync(join(process.cwd(), "prisma", "temp.prisma"), { encoding: 'utf-8' });
  const schema = cleanFile(rawSchema) as string[];

  const models: Model[] = [];
  const enums: Enum[] = [];
  // Weird hack to get around the fact that typescript sucks
  // See https://github.com/microsoft/TypeScript/issues/43349
  let datasource: Datasource | null = null;
  let generator: Generator | null = null;

  for(const line in schema) {

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

          const line = schema[i].trim().split(" ")
          const prop = line[0];
          const type = line[1];
          let args;
          if(line.length > 2) {
            args = line.slice(2);
          }

          model.props.push({
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

          const line = schema[i].trim().split(" ")
          const prop = line[0];

          enumSchema.props.push({
            name: prop
          });
        }
      }
    }

    if(schema[line]?.startsWith("datasource")) {
      const datasourceName = schema[line].split(" ")[1];
      let ds: Datasource = {
        name: datasourceName,
        props: []
      }

      for(let i = parseInt(line) + 1; i < schema.length; i++) {
        if(schema[i]?.startsWith("}")) {
          datasource = ds;
          break;
        } else {
          const line = schema[i].trim().split("=").map((l) => l.trim());
          const name = line[0];
          const value = line[1];

          ds.props.push({
            name,
            value
          })
        }
      }
    }

    if(schema[line]?.startsWith("generator")) {
      const generatorName = schema[line].split(" ")[1];
      let gn: Generator = {
        name: generatorName,
        props: []
      }

      for(let i = parseInt(line) + 1; i < schema.length; i++) {
        if(schema[i]?.startsWith("}")) {
          generator = gn;
          break;
        } else {
          const line = schema[i].trim().split("=").map((l) => l.trim());
          const name = line[0];
          const value = line[1];

          gn.props.push({
            name,
            value
          })
        }
      }
    }
  }

  return {
    models,
    enums,
    datasource,
    generator
  }
}

export function mergeModels(models: Model[]) {
  const mergedModels: Model[] = [];

  for(const model of models) {
    const existingModel = mergedModels.find((m) => m.name === model.name);

    if(existingModel) {
      for(const prop of model.props) {
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

export function mergeEnums(enums: Enum[]) {
  const mergedEnums: Enum[] = [];

  for(const enumSchema of enums) {
    const existingEnum = mergedEnums.find((e) => e.name === enumSchema.name);

    if(existingEnum) {
      for(const prop of enumSchema.props) {
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

export function generateSchema(datasource: Datasource, generator: Generator, models: Model[], enums: Enum[]) {
  let file = `
    // Generated by Prismixer - Do not edit manually
    // Leave a star here: https://github.com/JockeRider199/prismixer

    generator ${generator.name} {
    ${generator.props.map((p) => {
      return `\t${p.name} = ${p.value}`
    }).join("\n")}
    }

    datasource ${datasource.name} {
    ${datasource.props.map((p) => {
      return `\t${p.name} = ${p.value}`
    }).join("\n")}
    }
  `;

  for(const model of models) {
    file += `

      model ${model.name} {
      ${model.props.map((p) => {
        return `\t${p.name} ${p.type} ${p.args ? p.args.join(" ") : ""}`
      }).join("\n")}
      }
    `;
  }

  for(const enumSchema of enums) {
    file += `

      enum ${enumSchema.name} {
      ${enumSchema.props.map((p) => {
        return `\t${p.name}`
      }).join("\n")}
      }
    `;
  }

  return file;
}