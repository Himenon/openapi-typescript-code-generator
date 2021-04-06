import * as fs from "fs";
import { posix as path } from "path";

import { CodeGenerator, GeneratorTemplate } from "../lib";
import * as Templates from "../lib/templates";

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

  const apiClientGeneratorTemplate: GeneratorTemplate<Templates.ApiClient.Option> = {
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
    {
      generator: () => {
        return codeGenerator.getAdditionalTypeStatements();
      },
    },
    {
      generator: Templates.ApiClient.generator,
      option: option,
    },
  ]);

  writeText(outputFilename, code);
};

const generateSplitCode = (inputFilename: string, outputDir: string) => {
  const codeGenerator = new CodeGenerator(inputFilename);

  const apiClientGeneratorTemplate: GeneratorTemplate<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: { sync: false },
  };

  const typeDefCode = codeGenerator.generateTypeDefinition();
  const apiClientCode = codeGenerator.generateCode([
    {
      generator: () => {
        return [`import { Schemas } from "./types";`];
      },
    },
    {
      generator: () => {
        return codeGenerator.getAdditionalTypeStatements();
      },
    },
    apiClientGeneratorTemplate,
  ]);

  writeText(path.join(outputDir, "types.ts"), typeDefCode);
  writeText(path.join(outputDir, "apiClient.ts"), apiClientCode);
};

const main = () => {
  generateTypedefCodeOnly("test/api.test.domain/index.yml", "test/code/typedef-only/api.test.domain.ts", true);
  generateTypedefCodeOnly("test/infer.domain/index.yml", "test/code/typedef-only/infer.domain.ts", false);

  generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/api.test.domain.ts", true, { sync: false });
  generateTemplateCodeOnly("test/api.test.domain/index.yml", "test/code/template-only/sync-api.test.domain.ts", true, { sync: true });
  generateTemplateCodeOnly("test/infer.domain/index.yml", "test/code/template-only/infer.domain.ts", false, { sync: true });

  generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/api.test.domain.ts", true, {
    sync: false,
  });
  generateTypedefWithTemplateCode("test/api.test.domain/index.yml", "test/code/typedef-with-template/sync-api.test.domain.ts", true, {
    sync: true,
  });
  generateTypedefWithTemplateCode("test/infer.domain/index.yml", "test/code/typedef-with-template/infer.domain.ts", false, { sync: false });

  generateSplitCode("test/api.test.domain/index.yml", "test/code/split");
};

main();
