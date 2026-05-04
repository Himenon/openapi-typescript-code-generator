<<<<<<< HEAD
import { describe, expect, test } from "vitest";

import * as fs from "fs";
=======
import * as fs from "node:fs";
import { describe, expect, test } from "vitest";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

import { CodeGenerator } from "../../src";
import * as Templates from "../../src/templates";
import type * as Types from "../../src/types";

describe("raw-json-generate", () => {
  test("the raw json input result and the json file path result are same", () => {
    const generateCode = JSON.parse(fs.readFileSync("test/kubernetes/openapi-v1.18.5.json", { encoding: "utf-8" }));

    const codeGenerator1 = new CodeGenerator(generateCode);
    const codeGenerator2 = new CodeGenerator("test/kubernetes/openapi-v1.18.5.json");

    const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ClassApiClient.Option> = {
      generator: Templates.ClassApiClient.generator,
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
  }, 30000);
  test("yaml file path loadable", () => {
    const codeGenerator = new CodeGenerator("test/api.test.domain/index.yml");

    const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ClassApiClient.Option> = {
      generator: Templates.ClassApiClient.generator,
      option: {},
    };

    const code = codeGenerator.generateTypeDefinition([
      codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
      apiClientGeneratorTemplate,
    ]);

    expect(code).not.toBeFalsy();
  });
});
