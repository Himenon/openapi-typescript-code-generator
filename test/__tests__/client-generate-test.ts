import * as fs from "fs";
import * as path from "path";

import { CodeGenerator } from "../../src";
import * as Templates from "../../src/templates";
import type * as Types from "../../src/types";

describe("raw-json-generate", () => {
  test("the raw json input result and the json file path result are same", () => {
    const generateCode = JSON.parse(fs.readFileSync(path.join(__dirname, "../kubernetes/openapi-v1.18.5.json"), { encoding: "utf-8" }));

    const codeGenerator1 = new CodeGenerator(generateCode);
    const codeGenerator2 = new CodeGenerator(path.join(__dirname, "../kubernetes/openapi-v1.18.5.json"));

    const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
      generator: Templates.ApiClient.generator,
      option: {},
    };

    const code1 = codeGenerator1.generateTypeDefinition([
      codeGenerator1.getAdditionalTypeDefinitionCustomCodeGenerator(),
      apiClientGeneratorTemplate,
    ]);

    const code2 = codeGenerator2.generateTypeDefinition([
      codeGenerator1.getAdditionalTypeDefinitionCustomCodeGenerator(),
      apiClientGeneratorTemplate,
    ]);

    expect(code1).toBe(code2);
  });
  test("yaml file path loadable", () => {
    const codeGenerator = new CodeGenerator(path.join(__dirname, "../api.test.domain/index.yml"));

    const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
      generator: Templates.ApiClient.generator,
      option: {},
    };

    const code = codeGenerator.generateTypeDefinition([
      codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
      apiClientGeneratorTemplate,
    ]);

    expect(code).not.toBeFalsy();
  });
});
