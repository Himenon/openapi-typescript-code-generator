import * as fs from "fs";
import { posix as path } from "path";

import { CodeGenerator } from "../lib";
import * as Templates from "../lib/templates";
import type * as Types from "../lib/types";

const writeText = (filename: string, text: string): void => {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, text, { encoding: "utf-8" });
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

const main = () => {
  generateTypedefCodeOnly("test/api.test.domain/index.yml", "test/code/typedef-only/api.test.domain.ts", true);
  generateTypedefCodeOnly("test/infer.domain/index.yml", "test/code/typedef-only/infer.domain.ts", false);

  generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/api.test.domain.ts", true, { sync: false });
  generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/sync-api.test.domain.ts", true, { sync: true });
  generateTemplateCodeOnly("test/infer.domain/index.yml", "test/code/template-only/infer.domain.ts", false, { sync: true });

  generateTypedefWithTemplateCode("test/api.v2.domain/index.yml", "test/code/typedef-with-template/api.v2.domain.ts", false, { sync: false });
  generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/api.test.domain.ts", true, {
    sync: false,
  });
  generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/sync-api.test.domain.ts", true, {
    sync: true,
  });
  generateTypedefWithTemplateCode("test/infer.domain/index.yml", "test/code/typedef-with-template/infer.domain.ts", false, { sync: false });

  generateTypedefWithTemplateCode("test/argo-rollout/index.json", "test/code/typedef-with-template/argo-rollout.ts", false, {
    sync: false,
  });

  generateTypedefWithTemplateCode("test/ref.access/index.yml", "test/code/typedef-with-template/ref-access.ts", false, {
    sync: false,
  });

  generateSplitCode("test/api.test.domain/index.yml", "test/code/split");

  generateParameter("test/api.test.domain/index.yml", "test/code/parameter/api.test.domain.json");
  generateParameter("test/infer.domain/index.yml", "test/code/parameter/infer.domain.json");


};

main();
