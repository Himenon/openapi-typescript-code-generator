import { TsGenerator } from "@himenon/openapi-typescript-code-generator/esm/api";
import * as Types from "@himenon/openapi-typescript-code-generator/types";

interface Option {}

const factory = TsGenerator.Factory.create();

const generator: Types.CodeGenerator.GenerateFunction<Option> = (
  payload: Types.CodeGenerator.Params[],
  option,
): Types.CodeGenerator.IntermediateCode[] => {
  return payload.map(params => {
    return factory.InterfaceDeclaration.create({
      export: true,
      name: params.functionName,
      members: [],
    });
  });
};

const customGenerator: Types.CodeGenerator.CustomGenerator<Option> = {
  generator: generator,
  option: {},
};
