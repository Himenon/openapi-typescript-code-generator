import * as fs from "fs";
import * as path from "path";

import { CodeGenerator } from "../../src";
import * as Templates from "../../src/templates";
import type * as Types from "../../src/types";

describe("raw-json-generate", () => {
  test("kubernetes json", () => {
    const generateCode = JSON.parse(fs.readFileSync(path.join(__dirname, "../kubernetes/openapi-v1.18.5.json"), { encoding: "utf-8" }));

    const codeGenerator = new CodeGenerator(generateCode);

    const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
      generator: Templates.ApiClient.generator,
      option: {},
    };

    const code = codeGenerator.generateTypeDefinition([
      codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
      apiClientGeneratorTemplate,
    ]);

    expect(code).toMatchSnapshot();
  });
});
