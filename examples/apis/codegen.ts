import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import * as Templates from "@himenon/openapi-typescript-code-generator/templates";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";
import * as fs from "fs";

const main = () => {
  const codeGenerator = new CodeGenerator("./spec/openapi.yml");
  codeGenerator.validateOpenApiSchema({ logger: { displayLogLines: 1 } });
  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.FunctionalApiClient.Option> = {
    generator: Templates.FunctionalApiClient.generator,
    option: {},
  };

  const code = codeGenerator.generateTypeDefinition([
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    apiClientGeneratorTemplate,
  ]);
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
