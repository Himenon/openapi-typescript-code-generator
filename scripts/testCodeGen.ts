import * as fs from "fs";

import { CodeGenerator } from "../lib";
import * as Templates from "../lib/templates";

const generateCode = (inputFilename: string, outputFilename: string, isValidate: boolean, option: Templates.ApiClient.Option): void => {
  const codeGenerator = new CodeGenerator(inputFilename);
  const code = codeGenerator.generateTypeDefinition<Templates.ApiClient.Option>({
    generator: Templates.ApiClient.generator,
    option: option,
  });
  if (isValidate) {
    codeGenerator.validate({
      logger: { displayLogLines: 1 },
    });
  }

  fs.writeFileSync(outputFilename, code, { encoding: "utf-8" });
  console.log(`Generate Code : ${outputFilename}`);
};

const main = () => {
  generateCode("test/api.test.domain/index.yml", "test/code/api.test.domain.ts", true, { sync: false });
  generateCode("test/infer.domain/index.yml", "test/code/infer.domain.ts", false, { sync: false });
  generateCode("test/api.test.domain/index.yml", "test/code/sync-api.test.domain.ts", true, { sync: true });
};

main();
