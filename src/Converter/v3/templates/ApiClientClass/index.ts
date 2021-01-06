import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export { Method };

export interface Params {
  requestUri: string;
  methodName: string;
  responseNames: string[];
  argumentInterfaceName: string;
  parameterName?: string;
  requestBodyName?: string;
  requestParameterCategories: Method.MethodBody.Param[];
}

export const create = (factory: Factory.Type, list: Params[]): ts.Statement => {
  const methodList = list.map(params => {
    return Method.create(factory, {
      name: params.methodName,
      parameterName: params.argumentInterfaceName,
      responseNames: params.responseNames,
      requestParameterCategories: params.requestParameterCategories,
      requestUri: params.requestUri,
    });
  });
  const members = [Constructor.create(factory), ...methodList];
  return Class.create(factory, members);
};
