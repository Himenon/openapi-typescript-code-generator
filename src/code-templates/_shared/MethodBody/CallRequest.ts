import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import * as Utils from "../utils";
import { createEncodingMap } from "./createEncodingMap";
import type { MethodType } from "./types";

export interface Params {
  httpMethod: string;
  hasRequestBody: boolean;
}

/**
 *
 * const encodingMap = {
 *   "application/json": {},
 *   "application/x-www-form-urlencoded": {},
 * }
 */
const createEncodingParams = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params): ts.Expression | undefined => {
  const content = params.operationParams.requestBody?.content;
  if (!content) {
    return;
  }
  const encodingMap = createEncodingMap(content);
  if (Object.keys(encodingMap).length === 0) {
    return;
  }
  if (params.convertedParams.has2OrMoreRequestContentTypes) {
    return factory.Identifier.create({ name: `requestEncodings[params.headers["Content-Type"]]` });
  }
  return factory.Identifier.create({ name: `requestEncodings["${params.convertedParams.requestFirstContentType}"]` });
};

/**
 * this.apiClient.request("GET", url, requestBody, headers, queryParameters);
 */
export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params, methodType: MethodType): ts.CallExpression => {
  const { convertedParams } = params;
  const apiClientVariableIdentifier: Record<MethodType, string> = {
    class: "this.apiClient.request",
    function: "apiClient.request",
    "currying-function": "apiClient.request",
  };
  const expression = Utils.generateVariableIdentifier(factory, apiClientVariableIdentifier[methodType]);
  const requestBodyEncoding = createEncodingParams(factory, params);

  const requestArgs = factory.ObjectLiteralExpression.create({
    properties: [
      factory.PropertyAssignment.create({
        name: "httpMethod",
        initializer: factory.StringLiteral.create({ text: params.operationParams.httpMethod.toUpperCase() }),
      }),
      factory.ShorthandPropertyAssignment.create({
        name: methodType === "currying-function" ? "uri" : "url",
      }),
      factory.ShorthandPropertyAssignment.create({
        name: "headers",
      }),
      convertedParams.hasRequestBody &&
        factory.PropertyAssignment.create({
          name: "requestBody",
          initializer: Utils.generateVariableIdentifier(factory, "params.requestBody"),
        }),
      requestBodyEncoding &&
        factory.PropertyAssignment.create({
          name: "requestBodyEncoding",
          initializer: requestBodyEncoding,
        }),
      convertedParams.hasQueryParameters &&
        factory.PropertyAssignment.create({
          name: "queryParameters",
          initializer: factory.Identifier.create({ name: "queryParameters" }),
        }),
    ].flatMap(v => (v ? [v] : [])),
    multiLine: true,
  });

  const argumentsArray = [requestArgs, factory.Identifier.create({ name: "option" })];

  return factory.CallExpression.create({
    expression: expression,
    typeArguments: [],
    argumentsArray: argumentsArray,
  });
};
