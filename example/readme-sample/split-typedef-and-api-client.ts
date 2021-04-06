import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import * as Templates from "@himenon/openapi-typescript-code-generator/templates";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

const main = () => {
  const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: {},
  };

  const typeDefCode = codeGenerator.generateTypeDefinition();
  const apiClientCode = codeGenerator.generateCode([
    {
      generator: () => {
        return [`import { Schemas } from "./types";`];
      },
    },
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    apiClientGeneratorTemplate,
  ]);

  fs.writeFileSync("types.ts", typeDefCode, { encoding: "utf-8" });
  fs.writeFileSync("apiClient.ts", apiClientCode, { encoding: "utf-8" });
};

main();
