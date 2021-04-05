import ts from "typescript";

import { Factory } from "../factory";
import type { CodeGenerator } from "../types";
import type { CodeGeneratorParams } from "../types/extractSchema";
import * as ApiClientArgument from "./ApiClientArgument";
import * as ApiClientClass from "./ApiClientClass";

export interface Option {
  sync?: boolean;
}

export const makeApiClient: CodeGenerator.GenerateFunction<Option> = (
  codeGeneratorParamsList: CodeGeneratorParams[],
  option?: Option,
): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const factory = Factory.create();
  codeGeneratorParamsList.forEach(codeGeneratorParams => {
    if (codeGeneratorParams.hasRequestBody) {
      statements.push(ApiClientArgument.createRequestContentTypeReference(factory, codeGeneratorParams));
    }
    if (codeGeneratorParams.responseSuccessNames.length > 0) {
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
