<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import { TsGenerator } from "../../api";
import type { CodeGenerator } from "../../types";
import * as ApiClientArgument from "../_shared/ApiClientArgument";
import * as ApiClientInterface from "../_shared/ApiClientInterface";
import type { Option } from "../_shared/types";
import * as FunctionalApiClient from "./FunctionalApiClient";

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

  ApiClientInterface.create(factory, codeGeneratorParamsList, "currying-function", option || {}).forEach(statement => {
    statements.push(statement);
  });

  const apiClientStatements = FunctionalApiClient.create(factory, codeGeneratorParamsList, option || {});
  apiClientStatements.forEach(apiClientStatement => {
    statements.push(apiClientStatement);
  });

  return statements;
};
