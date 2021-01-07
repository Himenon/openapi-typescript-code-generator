import ts from "typescript";

import { Factory } from "../../../../TypeScriptCodeGenerator";
import * as ApiClientInterface from "./ApiClientInterface";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";
import * as Types from "./types";

export { Method };

export type Params = Types.MethodParams;

export const create = (factory: Factory.Type, list: Params[]): ts.Statement[] => {
  const methodList = list.map(params => {
    return Method.create(factory, params);
  });
  const members = [Constructor.create(factory), ...methodList];
  return [...ApiClientInterface.create(factory), Class.create(factory, members)];
};
