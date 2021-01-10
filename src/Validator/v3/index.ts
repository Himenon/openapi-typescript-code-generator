import * as fs from "fs";

import * as Ajv from "ajv";

import { OpenApi } from "../../Converter/v3/types";
import openapiSchema from "./openapi.json";

export const validate = (openapiDoc: OpenApi.Document) => {
  const ajv = new Ajv.default({ allErrors: true });
  const validate = ajv.compile(openapiSchema);
  const result = validate(openapiDoc);
  console.log({
    エラー件数: (validate.errors || []).length,
  });
  fs.writeFileSync("debug/validate.json", JSON.stringify(validate.errors, null, 2), { encoding: "utf-8" });
  return result;
};
