import ts from "typescript";

import type { TsGenerator } from "../../../../api";
import type { CodeGenerator } from "../../../../types";
import * as Utils from "../../utils";

export interface Params {
  httpMethod: string;
  hasRequestBody: boolean;
}

/**
 * this.apiClient.request("GET", url, requestBody, headers, queryParameters);
 */
export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params): ts.CallExpression => {
  const { convertedParams } = params;
  const expression = Utils.generateVariableIdentifier(factory, "this.apiClient.request");
  const argumentsArray = [
    factory.StringLiteral.create({ text: params.operationParams.httpMethod.toUpperCase() }),
    factory.Identifier.create({ name: "url" }),
    factory.Identifier.create({ name: "headers" }),
    convertedParams.hasRequestBody
      ? Utils.generateVariableIdentifier(factory, "params.requestBody")
      : factory.Identifier.create({ name: "undefined" }),
    convertedParams.hasQueryParameters
      ? factory.Identifier.create({ name: "queryParameters" })
      : factory.Identifier.create({ name: "undefined" }),
    factory.Identifier.create({ name: "option" }),
  ];

  return factory.CallExpression.create({
    expression: expression,
    typeArguments: [],
    argumentsArray: argumentsArray,
  });
};
