import * as fs from "fs";
import * as path from "path";

import * as Templates from "../../src/templates";
import type * as Types from "../../src/types";
import { CodeGenerator } from "../../src";


describe("raw-json-generate", () => {
  test("api.test.domain", () => {
    const generateCode = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../code/parameter/api.test.domain.json"), { encoding: "utf-8" })
    );

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
