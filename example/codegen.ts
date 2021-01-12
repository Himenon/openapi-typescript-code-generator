import * as fs from "fs";

import * as CodeGenerator from "../lib"; // = @himenon/openapi-typescript-code-generator

const main = () => {
  const params: CodeGenerator.Params = {
    version: "v3",
    entryPoint: "./spec/openapi.yml",
    enableValidate: true,
  };
  fs.mkdirSync("test/code", { recursive: true });
  const code = CodeGenerator.generateTypeScriptCode(params);
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
