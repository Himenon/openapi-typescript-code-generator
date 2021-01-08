import ts from "typescript";

import { Factory } from "../../../../../TypeScriptCodeGenerator";
import * as Utils from "../../utils";
import * as Type from "../types";
import * as CallRequest from "./CallRequest";
import * as HeaderParameter from "./HeaderParameter";
import * as PathParameter from "./PathParameter";
import * as QueryParameter from "./QueryParameter";

export interface Params$GenerateUrl {
  urlTemplate: Utils.Params$TemplateExpression;
}

export const create = (factory: Factory.Type, httpMethod: string, requestUri: string, list: Type.MethodBodyParams[]): ts.Statement[] => {
  const statements: ts.Statement[] = [];

  // Generate Path Parameter
  const pathParameters = list.filter<PathParameter.Param>(PathParameter.isPathParameter);
  statements.push(PathParameter.create(factory, requestUri, pathParameters));

  // Generate Header Parameter
  const headerParameter = list.filter(item => item.in === "header");
  const headerObject = Object.values(headerParameter).reduce<{ [key: string]: string }>((previous, current) => {
    return { ...previous, [current.name]: `params.parameter.${current.name}` };
  }, {});
  statements.push(
    HeaderParameter.create(factory, {
      variableName: "headers",
      object: headerObject,
      contentType: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }),
  );

  // Generate Query Parameter
  const queryParameter = list.filter(item => item.in === "query");
  const queryObject = Object.values(queryParameter).reduce<{ [key: string]: string }>((previous, current) => {
    return { ...previous, [current.name]: `params.parameter.${current.name}` };
  }, {});
  statements.push(QueryParameter.create(factory, { variableName: "queryParameters", object: queryObject }));

  // Generate CallRequest

  statements.push(
    factory.ReturnStatement.create({
      expression: CallRequest.create(factory, { httpMethod: httpMethod.toUpperCase(), hasRequestBody: false, contentType: undefined }),
    }),
  );

  return statements.length == 0 ? [factory.ReturnStatement.create({})] : statements;
};
