import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import * as fs from "fs";

const main = () => {
  const codeGenerator = new CodeGenerator("your/openapi/spec.yml");
  const code = codeGenerator.generateTypeDefinition();
  fs.writeFileSync("client.ts", code, { encoding: "utf-8" });
};

main();
