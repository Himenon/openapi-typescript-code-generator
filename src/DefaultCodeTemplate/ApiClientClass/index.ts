import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import { CodeGeneratorParams } from "../../Converter/v3";
import * as ApiClientInterface from "./ApiClientInterface";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export { Method };

export const create = (factory: Factory.Type, list: CodeGeneratorParams[]): ts.Statement[] => {
  const methodList = list.map(params => {
    return Method.create(factory, params);
  });
  const members = [Constructor.create(factory), ...methodList];
  return [...ApiClientInterface.create(factory, list), Class.create(factory, members)];
};
