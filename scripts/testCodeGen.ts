import * as fs from "fs";
import { posix as path } from "path";

import prettier from "prettier";

import { CodeGenerator } from "../lib";
import * as Templates from "../lib/templates";
import type * as Types from "../lib/types";

const prettierConfig = require("../.prettierrc.json");

const codeFormat = (code: string): string => {
  try {
    return prettier.format(code, {
      ...prettierConfig,
      parser: "babel",
    });
  } catch (error) {
    console.log("Failed code format");
    return code;
  }
};

const writeText = (filename: string, text: string): void => {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, codeFormat(text), { encoding: "utf-8" });
  console.log(`Generate Code : ${filename}`);
};

const generateTypedefCodeOnly = (inputFilename: string, outputFilename: string, isValidate: boolean) => {
  const codeGenerator = new CodeGenerator(inputFilename);
  if (isValidate) {
    codeGenerator.validateOpenApiSchema({
      logger: { displayLogLines: 1 },
    });
  }
  const code = codeGenerator.generateTypeDefinition();
  writeText(outputFilename, code);
};

const generateTemplateCodeOnly = (
  inputFilename: string,
  outputFilename: string,
  isValidate: boolean,
  option: Templates.ApiClient.Option,
): void => {
  const codeGenerator = new CodeGenerator(inputFilename);
  if (isValidate) {
    codeGenerator.validateOpenApiSchema({
      logger: { displayLogLines: 1 },
    });
  }

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: option,
  };

  const code = codeGenerator.generateCode([apiClientGeneratorTemplate]);

  writeText(outputFilename, code);
};

const generateTypedefWithTemplateCode = (
  inputFilename: string,
  outputFilename: string,
  isValidate: boolean,
  option: Templates.ApiClient.Option,
): void => {
  const codeGenerator = new CodeGenerator(inputFilename);
  if (isValidate) {
    codeGenerator.validateOpenApiSchema({
      logger: { displayLogLines: 1 },
    });
  }

  const code = codeGenerator.generateTypeDefinition([
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    {
      generator: Templates.ApiClient.generator,
      option: option,
    },
  ]);

  writeText(outputFilename, code);
};

const generateSplitCode = (inputFilename: string, outputDir: string) => {
  const codeGenerator = new CodeGenerator(inputFilename);

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: { sync: false, additionalMethodComment: true },
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

  writeText(path.join(outputDir, "types.ts"), typeDefCode);
  writeText(path.join(outputDir, "apiClient.ts"), apiClientCode);
};

const generateParameter = (inputFilename: string, outputFilename: string) => {
  const codeGenerator = new CodeGenerator(inputFilename);
  writeText(outputFilename, JSON.stringify(codeGenerator.getCodeGeneratorParamsArray(), null, 2));
};

const generateAdvancedTestCode = async (inputFilename: string, outputDir: string): Promise<void> => {
  const codeGenerator = new CodeGenerator(inputFilename);

  await codeGenerator.init();

  const typeDefCode = codeGenerator.generateCode([
    {
      kind: "advanced",
      generator: Templates.TypeDef.generator,
    },
  ]);
  writeText(path.join(outputDir, "types.ts"), typeDefCode);
};

const main = async () => {
  // generateTypedefCodeOnly("test/api.test.domain/index.yml", "test/code/typedef-only/api.test.domain.ts", true);
  await generateAdvancedTestCode("test/api.test.domain/index.yml", "test/code/advanced/api.test.domain.ts");
  // generateTypedefCodeOnly("test/infer.domain/index.yml", "test/code/typedef-only/infer.domain.ts", false);

  // generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/api.test.domain.ts", true, { sync: false });
  // generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/sync-api.test.domain.ts", true, { sync: true });
  // generateTemplateCodeOnly("test/infer.domain/index.yml", "test/code/template-only/infer.domain.ts", false, { sync: true });

  // generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/api.test.domain.ts", true, {
  //   sync: false,
  // });
  // generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/sync-api.test.domain.ts", true, {
  //   sync: true,
  // });
  // generateTypedefWithTemplateCode("test/infer.domain/index.yml", "test/code/typedef-with-template/infer.domain.ts", false, { sync: false });

  // generateSplitCode("test/api.test.domain/index.yml", "test/code/split");

  // generateParameter("test/api.test.domain/index.yml", "test/code/parameter/api.test.domain.json");
  // generateParameter("test/infer.domain/index.yml", "test/code/parameter/infer.domain.json");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
