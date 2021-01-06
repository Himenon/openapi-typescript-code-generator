import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as Utils from "../utils";
import * as PathParameter from "./Body/PathParameter";

export interface Param {
  name: string;
  in: "path" | "query" | "header" | "cookie";
  required: boolean;
  style?: "matrix" | "label" | "form" | "simple" | "spaceDelimited" | "pipeDelimited" | "deepObject";
  explode?: string;
}

export interface Params$GenerateUrl {
  urlTemplate: Utils.Params$TemplateExpression;
}

export const create = (factory: Factory.Type, requestUri: string, list: Param[]): ts.Statement[] => {
  const statements: ts.Statement[] = [];
  const pathParameters = list.filter<PathParameter.Param>(PathParameter.isPathParameter);
  statements.push(PathParameter.create(factory, requestUri, pathParameters));
  return statements.length == 0 ? [factory.ReturnStatement.create({})] : statements;
};
