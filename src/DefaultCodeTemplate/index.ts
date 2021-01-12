import ts from "typescript";

import * as TypeScriptCodeGenerator from "../CodeGenerator";
import * as Converter from "../Converter";
import * as ApiClientArgument from "./ApiClientArgument";
import * as ApiClientClass from "./ApiClientClass";

export const makeClientApiClient: Converter.v3.Generator.MakeApiClientFunction = (
  context: ts.TransformationContext,
  codeGeneratorParamsList: Converter.v3.CodeGeneratorParams[],
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
  ApiClientClass.create(factory, codeGeneratorParamsList).forEach(newStatement => {
    statements.push(newStatement);
  });
  return statements;
};
