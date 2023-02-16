"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFile = exports.mergeModels = exports.getGenerator = exports.getDatasource = exports.parseModels = exports.loadFile = exports.cleanFile = exports.run = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = __importDefault(require("../constants"));
const preprocess_1 = require("./preprocess");
const postprocess_1 = require("./postprocess");
async function run() {
    // Preprocess
    await (0, preprocess_1.ensureInitiated)();
    await (0, preprocess_1.ensurePrismaImportInstalled)();
    await (0, preprocess_1.ensureModelsCreated)();
    await (0, preprocess_1.ensureTempFileDeleted)();
    await (0, preprocess_1.prismaImport)();
    let schema = await loadFile(constants_1.default.tempMergeFilename);
    let data = await cleanFile(schema);
    let datasource = await getDatasource(data);
    let generator = await getGenerator(data);
    let models = await parseModels(data);
    models = await mergeModels(models);
    await generateFile(datasource, generator, models);
    // Postprocess
    await (0, postprocess_1.formatPrismaFile)();
    await (0, postprocess_1.deleteTempFile)();
    await (0, postprocess_1.generatePrismaClient)();
}
exports.run = run;
async function cleanFile(schema) {
    return schema.split("\n").map((l) => {
        if (!l.startsWith("//")) {
            return l.replace(/\s\s+/g, ' ');
        }
    }).filter((l) => l !== undefined && l !== "");
}
exports.cleanFile = cleanFile;
async function loadFile(filename) {
    return (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), "prisma", `${filename}.prisma`), { encoding: 'utf-8' });
}
exports.loadFile = loadFile;
async function parseModels(schema) {
    let models = [];
    for (let line in schema) {
        if (schema[line]?.startsWith("model")) {
            let model = {
                name: schema[line].split(" ")[1],
                props: []
            };
            for (let i = parseInt(line) + 1; i < schema.length; i++) {
                if (schema[i]?.startsWith("}")) {
                    models.push(model);
                    break;
                }
                else {
                    let line = schema[i].trim().split(" ");
                    let prop = line[0];
                    let type = line[1];
                    let args;
                    if (line.length > 2) {
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
exports.parseModels = parseModels;
async function getDatasource(schema) {
    for (let line in schema) {
        if (schema[line]?.startsWith("datasource")) {
            let datasourceName = schema[line].split(" ")[1];
            let provider;
            let url;
            for (let i = parseInt(line) + 1; i < schema.length; i++) {
                if (schema[i]?.startsWith("}")) {
                    let datasource = {
                        name: datasourceName,
                        provider: provider ?? "",
                        url: url ?? ""
                    };
                    return datasource;
                }
                else {
                    let line = schema[i].trim().split("=").map((l) => l.trim());
                    if (line[0] == "provider") {
                        provider = line[1];
                    }
                    else if (line[0] == "url") {
                        url = line[1];
                    }
                }
            }
        }
    }
}
exports.getDatasource = getDatasource;
async function getGenerator(schema) {
    for (let line in schema) {
        if (schema[line]?.startsWith("generator")) {
            let generatorName = schema[line].split(" ")[1];
            let provider;
            let output;
            for (let i = parseInt(line) + 1; i < schema.length; i++) {
                if (schema[i]?.startsWith("}")) {
                    let generator = {
                        name: generatorName,
                        provider: provider ?? "",
                        output: output
                    };
                    return generator;
                }
                else {
                    let line = schema[i].trim().split("=").map((l) => l.trim());
                    if (line[0] == "provider") {
                        provider = line[1];
                    }
                    else if (line[0] == "output") {
                        output = line[1];
                    }
                }
            }
        }
    }
}
exports.getGenerator = getGenerator;
async function mergeModels(models) {
    let mergedModels = [];
    for (let model of models) {
        let existingModel = mergedModels.find((m) => m.name === model.name);
        if (existingModel) {
            for (let prop of model.props) {
                if (!existingModel.props.find((p) => p.name === prop.name)) {
                    existingModel.props.push(prop);
                }
            }
        }
        else {
            mergedModels.push(model);
        }
    }
    return mergedModels;
}
exports.mergeModels = mergeModels;
async function generateFile(datasource, generator, models) {
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
    for (let model of models) {
        file += `

    model ${model.name} {
    ${model.props.map((p) => {
            return `\t${p.name} ${p.type} ${p.args ? p.args.join(" ") : ""}`;
        }).join("\n")}
    }`;
    }
    (0, fs_1.writeFileSync)((0, path_1.join)(process.cwd(), "prisma", `${constants_1.default.finalFilename}.prisma`), file, { encoding: 'utf-8' });
}
exports.generateFile = generateFile;
