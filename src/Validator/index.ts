//
// Copyright (c) 2018 Kogo Software LLC
// Reference: https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-schema-validator#readme
//
import * as Ajv from "ajv";

import type { OpenApi } from "../Converter/types";
import openapiSchema from "./openapi.json";

export interface LogOption {
  /**
   * default: undefined (all logs)
   * Number of lines displayed in the latest log
   */
  displayLogLines?: number;
}

const showLogs = (logs: any[], option?: LogOption) => {
  if (option && option.displayLogLines && option.displayLogLines > 0) {
    const latestLogs = logs.slice(0, option.displayLogLines);
    const moreLogNum = logs.length - latestLogs.length;
    console.error("Correct the validation error before generating the code.");
    console.error(`There are a total of ${logs.length} errors below.`);
    console.error("");
    console.error(latestLogs);
    console.error("");
    if (moreLogNum > 0) {
      console.error(`more ${moreLogNum} error logs`);
      console.error("");
    }
  } else {
    console.error("Correct the validation error before generating the code.");
    console.error(`There are a total of ${logs.length} errors below.`);
    console.error("");
    console.error(logs);
    console.error("");
  }
};

export const validate = (openapiDoc: OpenApi.Document, option?: LogOption): void => {
  const ajv = new Ajv.default({ allErrors: true });
  const validate = ajv.compile(openapiSchema);
  validate(openapiDoc);
  if (validate.errors) {
    showLogs(validate.errors, option);
    throw new Error("Validation Error");
  }
};
