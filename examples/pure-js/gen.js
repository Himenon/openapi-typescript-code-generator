import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";

const main = () => {
  const codeGenerator = new CodeGenerator("spec/openapi.yml");
  const code = codeGenerator.generateTypeDefinition();
  fs.mkdirSync("output", { recursive: true });
  fs.writeFileSync("output/client.ts", code, { encoding: "utf-8" });
};

main();
