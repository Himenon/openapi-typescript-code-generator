import * as fs from "fs";

import * as CodeGenerator from "../lib";

const gen = (name: string, enableValidate = true): void => {
  const params: CodeGenerator.Params = {
    entryPoint: `test/${name}/index.yml`,
    enableValidate,
    log: {
      validator: {
        displayLogLines: 1,
      },
    },
  };
  fs.mkdirSync("test/code", { recursive: true });
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync(`test/code/${name}.ts`, code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/${name}.ts`);
};

const main = () => {
  gen("api.test.domain");
  gen("infer.domain", false);
};

main();
