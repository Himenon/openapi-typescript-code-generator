import * as fs from "fs";

import { CodeGenerator } from "../lib"; // = @himenon/openapi-typescript-code-generator
import * as Templates from "../lib/templates"; // = @himenon/openapi-typescript-code-generator/templates
import * as Types from "../lib/types"; // = @himenon/openapi-typescript-code-generator/types

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
