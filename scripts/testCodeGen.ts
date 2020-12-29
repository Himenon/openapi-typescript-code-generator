import * as CodeGenerator from "../lib";
import * as fs from "fs";

const main = () => {
  const params: CodeGenerator.Params = {
    version: "v3",
    entryPoint: "test/api.test.domain/index.yml",
  };
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("test/code/api.test.domain.ts", code, { encoding: "utf-8" });
  console.log(`Generate Code : test/code/api.test.domain.ts`);
};

main();
