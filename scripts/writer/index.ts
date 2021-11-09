import * as fs from "fs";
import { posix as path } from "path";

import { CodeGenerator, Option as CodeGeneratorOption } from "../../lib";
import * as Templates from "../../lib/templates";
import type * as Types from "../../lib/types";

const writeText = (filename: string, text: string): void => {
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, text, { encoding: "utf-8" });
  console.log(`Generate Code : ${filename}`);
};

export const generateTypedefCodeOnly = (inputFilename: string, outputFilename: string, isValidate: boolean) => {
  const codeGenerator = new CodeGenerator(inputFilename);
  if (isValidate) {
    codeGenerator.validateOpenApiSchema({
      logger: { displayLogLines: 1 },
    });
  }
  const code = codeGenerator.generateTypeDefinition();
  writeText(outputFilename, code);
};

export const generateTemplateCodeOnly = (
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

export const generateTypedefWithTemplateCode = (
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

export const generateSplitCode = (inputFilename: string, outputDir: string) => {
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

export const generateParameter = (inputFilename: string, outputFilename: string) => {
  const codeGenerator = new CodeGenerator(inputFilename);
  writeText(outputFilename, JSON.stringify(codeGenerator.getCodeGeneratorParamsArray(), null, 2));
};

export const generateFormatTypeCode = (inputFilename: string, outputFilename: string) => {
  const option: CodeGeneratorOption = {
    convertOption: {
      formatConversions: [
        {
          selector: {
            format: "binary",
          },
          output: {
            type: ["Blob"],
          },
        },
        {
          selector: {
            format: "int-or-string",
          },
          output: {
            type: ["number", "string"],
          },
        },
        {
          selector: {
            format: "custom-type",
          },
          output: {
            type: ["CustomType"],
          },
        },
        {
          selector: {
            format: "date-time",
          },
          output: {
            type: ["Date"],
          },
        },
        {
          selector: {
            format: "A-and-B",
          },
          output: {
            type: ["A", "B"],
            multiType: "allOf",
          },
        },
      ],
    },
  };
  const codeGenerator = new CodeGenerator(inputFilename, option);

  const apiClientGeneratorTemplate: Types.CodeGenerator.CustomGenerator<Templates.ApiClient.Option> = {
    generator: Templates.ApiClient.generator,
    option: {},
  };

  const code = codeGenerator.generateTypeDefinition([
    codeGenerator.getAdditionalTypeDefinitionCustomCodeGenerator(),
    apiClientGeneratorTemplate,
  ]);

  writeText(outputFilename, code);
};
