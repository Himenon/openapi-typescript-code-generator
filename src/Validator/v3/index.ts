//
// Copyright (c) 2018 Kogo Software LLC
// Reference: https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-schema-validator#readme
//
import * as Ajv from "ajv";

import { OpenApi } from "../../Converter/v3/types";
import openapiSchema from "./openapi.json";

export const validate = (openapiDoc: OpenApi.Document): void => {
  const ajv = new Ajv.default({ allErrors: true });
  const validate = ajv.compile(openapiSchema);
  validate(openapiDoc);
  if (validate.errors) {
    console.error("Correct the validation error before generating the code.");
    console.error(`There are a total of ${validate.errors.length} errors below.`);
    console.error("");
    console.error(validate.errors);
    console.error("");
    process.exit(1);
  }
};
