import * as fs from "fs";

import { CodeGenerator } from "@himenon/openapi-typescript-code-generator";
import type * as Types from "@himenon/openapi-typescript-code-generator/types";

/** ここにCode Templateの定義を記述してください  */
const customGenerator: Types.CodeGenerator.CustomGenerator<{}> = {
  /** .... */
};

const codeGenerator = new CodeGenerator("your/openapi/spec.yml");

const code = codeGenerator.generateCode([customGenerator]);

fs.writeFileSync("output/file/name", code, { encoding: "utf-8" });
