import ts from "typescript";

import { Factory } from "../../../../../CodeGenerator";
import { CodeGeneratorParams } from "../../../types";
import * as Utils from "../../utils";
import * as CallRequest from "./CallRequest";
import * as HeaderParameter from "./HeaderParameter";
import * as PathParameter from "./PathParameter";
import * as QueryParameter from "./QueryParameter";

export interface Params$GenerateUrl {
  urlTemplate: Utils.Params$TemplateExpression;
}

export const create = (factory: Factory.Type, params: CodeGeneratorParams): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const { pickedParameters } = params;

  // Generate Path Parameter
  const pathParameters = pickedParameters.filter(PathParameter.isPathParameter);
  statements.push(PathParameter.create(factory, params.requestUri, pathParameters));

  const initialHeaderObject: Utils.LiteralExpressionObject = {};
  if (params.hasOver2RequestContentTypes) {
    initialHeaderObject["Content-Type"] = {
      type: "variable",
      value: `params.headers.Content-Type`,
    };
  } else if (params.requestFirstContentType) {
    initialHeaderObject["Content-Type"] = {
      type: "string",
      value: params.requestFirstContentType,
    };
  }
  if (params.hasOver2SuccessResponseContentTypes) {
    initialHeaderObject["Accept"] = {
      type: "variable",
      value: `params.headers.Accept`,
    };
  } else if (params.responseFirstSuccessContentType) {
    initialHeaderObject["Accept"] = {
      type: "string",
      value: params.responseFirstSuccessContentType,
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
  if (params.hasQueryParameters) {
    const queryParameter = pickedParameters.filter(item => item.in === "query");
    const queryObject = Object.values(queryParameter).reduce<{ [key: string]: QueryParameter.Item }>((previous, current) => {
      return {
        ...previous,
        [current.name]: { type: "variable", value: `params.parameter.${current.name}`, style: current.style, explode: !!current.explode },
      };
    }, {});
    statements.push(QueryParameter.create(factory, { variableName: "queryParameters", object: queryObject }));
  }

  // Generate CallRequest
  statements.push(
    factory.ReturnStatement.create({
      expression: CallRequest.create(factory, params),
    }),
  );

  return statements.length == 0 ? [factory.ReturnStatement.create({})] : statements;
};
