import ts from "typescript";

import { Factory } from "../../../../../TypeScriptCodeGenerator";
import * as Utils from "../../utils";

export interface Params {
  httpMethod: string;
}

/**
 * this.apiClient.request("GET", url, requestBody, headers, queryParameters);
 */
export const create = (factory: Factory.Type, params: Params): ts.CallExpression => {
  const expression = Utils.generateVariableIdentifier(factory, "this.apiClient.request");

  const argumentsArray = [
    factory.StringLiteral.create({ text: "GET" }),
    factory.Identifier.create({ name: "url" }),
    factory.Identifier.create({ name: "requestBody" }),
    factory.Identifier.create({ name: "headers" }),
    factory.Identifier.create({ name: "queryParameters" }),
  ];

  return factory.CallExpression.create({
    expression: expression,
    argumentsArray: argumentsArray,
  });
};
