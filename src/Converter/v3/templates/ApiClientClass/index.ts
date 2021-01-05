import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export interface Params {
  methodName: string;
  responseNames: string[];
  argumentInterfaceName: string;
  parameterName?: string;
  requestBodyName?: string;
}

export const create = (factory: Factory.Type, list: Params[]): ts.Statement => {
  const methodList = list.map(params => {
    return Method.create(factory, {
      name: params.methodName,
      parameterName: params.parameterName,
      responseNames: params.responseNames,
    });
  });
  const members = [Constructor.create(factory), ...methodList];
  return Class.create(factory, members);
};
