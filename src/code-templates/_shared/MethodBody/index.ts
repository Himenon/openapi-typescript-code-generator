import ts from "typescript";

import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import { escapeText2 as escapeText } from "../../../utils";
import * as Utils from "../utils";
import * as CallRequest from "./CallRequest";
import * as HeaderParameter from "./HeaderParameter";
import * as PathParameter from "./PathParameter";
import * as QueryParameter from "./QueryParameter";
import type { MethodType } from "./types";

export interface Params$GenerateUrl {
  urlTemplate: Utils.Params$TemplateExpression;
}

export const create = (factory: TsGenerator.Factory.Type, params: CodeGenerator.Params, methodType: MethodType): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const { convertedParams } = params;
  const { pickedParameters } = convertedParams;

  // Generate Path Parameter
  const pathParameters = pickedParameters.filter(PathParameter.isPathParameter);
  statements.push(PathParameter.create(factory, params.operationParams.requestUri, pathParameters, methodType));

  const initialHeaderObject: Utils.LiteralExpressionObject = {};
  if (convertedParams.has2OrMoreRequestContentTypes) {
    initialHeaderObject["Content-Type"] = {
      type: "variable",
      value: `params.headers.Content-Type`,
    };
  } else if (convertedParams.requestFirstContentType) {
    initialHeaderObject["Content-Type"] = {
      type: "string",
      value: convertedParams.requestFirstContentType,
    };
  }
  if (convertedParams.has2OrMoreSuccessResponseContentTypes) {
    initialHeaderObject["Accept"] = {
      type: "variable",
      value: `params.headers.Accept`,
    };
  } else if (convertedParams.successResponseFirstContentType) {
    initialHeaderObject["Accept"] = {
      type: "string",
      value: convertedParams.successResponseFirstContentType,
    };
  }

  // Generate Header Parameter
  const headerParameter = pickedParameters.filter(item => item.in === "header");
  const headerObject = Object.values(headerParameter).reduce<Utils.LiteralExpressionObject>((previous, current) => {
    return { ...previous, [current.name]: { type: "variable", value: `params.parameter.${current.name}` } };
  }, initialHeaderObject);
  statements.push(
    HeaderParameter.create(factory, {
      variableName: "headers",
      object: headerObject,
    }),
  );

  // Generate Query Parameter
  if (convertedParams.hasQueryParameters) {
    const queryParameter = pickedParameters.filter(item => item.in === "query");
    const queryObject = Object.values(queryParameter).reduce<{ [key: string]: QueryParameter.Item }>((previous, current) => {
      const { text, escaped } = escapeText(current.name);
      const variableDeclaraText = escaped ? `params.parameter[${text}]` : `params.parameter.${text}`;
      return {
        ...previous,
        [current.name]: { type: "variable", value: variableDeclaraText, style: current.style, explode: !!current.explode },
      };
    }, {});
    statements.push(QueryParameter.create(factory, { variableName: "queryParameters", object: queryObject }));
  }

  // Generate CallRequest
  statements.push(
    factory.ReturnStatement.create({
      expression: CallRequest.create(factory, params, methodType),
    }),
  );

  return statements.length === 0 ? [factory.ReturnStatement.create({})] : statements;
};
