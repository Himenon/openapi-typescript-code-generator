import * as fs from "fs";

import * as CodeGenerator from "../lib";

const main = () => {
  const params: CodeGenerator.Params = {
    entryPoint: "test/api.test.domain/index.yml",
    log: {
      validator: {
        displayLogLines: 3,
      },
    },
  };
  fs.mkdirSync("test/code", { recursive: true });
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("test/code/api.test.domain.ts", code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/api.test.domain.ts`);
};

main();
