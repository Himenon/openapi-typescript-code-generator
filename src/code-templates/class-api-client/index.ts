<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import { TsGenerator } from "../../api";
import type { CodeGenerator } from "../../types";
import * as ApiClientArgument from "../_shared/ApiClientArgument";
import type { Option } from "../_shared/types";
import * as ApiClientClass from "./ApiClientClass";

export type { Option };

export const generator: CodeGenerator.GenerateFunction<Option> = (
  codeGeneratorParamsList: CodeGenerator.Params[],
  option?: Option,
): CodeGenerator.IntermediateCode[] => {
  const statements: string[] = [];
  const factory = TsGenerator.Factory.create();
  codeGeneratorParamsList.forEach(codeGeneratorParams => {
    const { convertedParams } = codeGeneratorParams;
    if (convertedParams.hasRequestBody) {
      statements.push(ApiClientArgument.createRequestContentTypeReference(factory, codeGeneratorParams));
    }
    if (convertedParams.responseSuccessNames.length > 0) {
      statements.push(ApiClientArgument.createResponseContentTypeReference(factory, codeGeneratorParams));
    }
    const typeDeclaration = ApiClientArgument.create(factory, codeGeneratorParams);
    if (typeDeclaration) {
      statements.push(typeDeclaration);
    }
  });
  ApiClientClass.create(factory, codeGeneratorParamsList, option || {}).forEach(newStatement => {
    statements.push(newStatement);
  });
  return statements;
};
