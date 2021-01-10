import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { CodeGeneratorParams } from "../../../Converter/v3";
import * as Utils from "../../utils";

export interface Params {
  httpMethod: string;
  hasRequestBody: boolean;
}

/**
 * this.apiClient.request("GET", url, requestBody, headers, queryParameters);
 */
export const create = (factory: Factory.Type, params: CodeGeneratorParams): ts.CallExpression => {
  const expression = Utils.generateVariableIdentifier(factory, "this.apiClient.request");
  const argumentsArray = [
    factory.StringLiteral.create({ text: params.httpMethod.toUpperCase() }),
    factory.Identifier.create({ name: "url" }),
    params.hasRequestBody ? Utils.generateVariableIdentifier(factory, "params.requestBody") : factory.Identifier.create({ name: "undefined" }),
    factory.Identifier.create({ name: "headers" }),
    params.hasQueryParameters ? factory.Identifier.create({ name: "queryParameters" }) : factory.Identifier.create({ name: "undefined" }),
    factory.Identifier.create({ name: "option" }),
  ];

  return factory.CallExpression.create({
    expression: expression,
    argumentsArray: argumentsArray,
  });
};
