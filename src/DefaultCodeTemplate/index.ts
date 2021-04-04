import ts from "typescript";

import * as TypeScriptCodeGenerator from "../CodeGenerator";
import type { CodeGenerator } from "../types";
import type { CodeGeneratorParams } from "../types/extractSchema";
import * as ApiClientArgument from "./ApiClientArgument";
import * as ApiClientClass from "./ApiClientClass";

export const makeApiClient: CodeGenerator.GenerateFunction = (
  context: ts.TransformationContext,
  codeGeneratorParamsList: CodeGeneratorParams[],
  option: CodeGenerator.Option,
): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const factory = TypeScriptCodeGenerator.Factory.create(context);
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
  ApiClientClass.create(factory, codeGeneratorParamsList, option).forEach(newStatement => {
    statements.push(newStatement);
  });
  return statements;
};
