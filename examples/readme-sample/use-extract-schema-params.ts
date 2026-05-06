import type * as Types from "@himenon/openapi-typescript-code-generator/types";

type Option = {};

const generator: Types.CodeGenerator.GenerateFunction<Option> = (payload: Types.CodeGenerator.Params[]): string[] => {
  return payload.map(params => {
    return `function ${params.operationId}() { console.log("${params.operationParams.comment}") }`;
  });
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
};
