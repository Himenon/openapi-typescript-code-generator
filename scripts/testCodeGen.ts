import * as fs from "fs";

import * as CodeGenerator from "../lib";

const gen = (name: string, enableValidate = true): void => {
  const params: CodeGenerator.OpenApiTsCodeGen.Configuration = {
    entryPoint: `test/${name}/index.yml`,
    validator: {
      openapiSchema: enableValidate,
      logger: {
        displayLogLines: 1,
      },
    },
  };
  fs.mkdirSync("test/code", { recursive: true });
  const output = CodeGenerator.make(params);
  fs.writeFileSync(`test/code/${name}.ts`, output.typeDefinition.value, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/${name}.ts`);
};

const genSyncMode = (name: string, enableValidate = true): void => {
  const params: CodeGenerator.OpenApiTsCodeGen.Configuration = {
    entryPoint: `test/${name}/index.yml`,
    typeDefinitionGenerator: {
      additional: {
        template: "",
        option: {
          sync: true,
        },
      }
    },
    validator: {
      openapiSchema: enableValidate,
      logger: {
        displayLogLines: 1,
      },
    },
  };
  fs.mkdirSync("test/code", { recursive: true });
  const code = CodeGenerator.make(params);
  fs.writeFileSync(`test/code/sync-${name}.ts`, code.typeDefinition.value, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/sync-${name}.ts`);
};

const main = () => {
  gen("api.test.domain");
  gen("infer.domain", false);
  genSyncMode("api.test.domain");
};

main();
