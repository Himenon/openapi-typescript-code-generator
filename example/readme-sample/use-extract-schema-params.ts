import * as Types from "@himenon/openapi-typescript-code-generator/types";

interface Option {}

const generator: Types.CodeGenerator.GenerateFunction<Option> = (payload: Types.CodeGenerator.Params[], option): string[] => {
  return payload.map(params => {
    return `function ${params.operationId}() { console.log("${params.comment}") }`;
  });
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
};
