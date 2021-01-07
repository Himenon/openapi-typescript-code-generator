import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as ApiClientInterface from "./ApiClientInterface";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export { Method };

export interface Params {
  requestUri: string;
  httpMethod: string;
  operationId: string;
  responseNames: string[];
  requestContentTypeList: string[]; // "application/json", "application/xml" ...
  successResponseContentTypeList: string[]; // "application/json", "application/xml" ...
  argumentInterfaceName: string;
  parameterName?: string;
  requestBodyName?: string;
  requestParameterCategories: Method.MethodBody.Param[];
}

export const create = (factory: Factory.Type, list: Params[]): ts.Statement[] => {
  const methodList = list.map(params => {
    return Method.create(factory, {
      httpMethod: params.httpMethod,
      name: params.operationId,
      parameterName: params.argumentInterfaceName,
      responseNames: params.responseNames,
      requestParameterCategories: params.requestParameterCategories,
      requestUri: params.requestUri,
    });
  });
  const members = [Constructor.create(factory), ...methodList];
  return [...ApiClientInterface.create(factory), Class.create(factory, members)];
};
