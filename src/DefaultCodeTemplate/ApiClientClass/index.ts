import ts from "typescript";

import { Factory } from "../../CodeGenerator";
import type { CodeGenerator, CodeGeneratorParams } from "../../Converter/v3";
import * as ApiClientInterface from "./ApiClientInterface";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export { Method };

export const create = (factory: Factory.Type, list: CodeGeneratorParams[], option: CodeGenerator.Option): ts.Statement[] => {
  const methodList = list.map(params => {
    return Method.create(factory, params, option);
  });
  const members = [Constructor.create(factory), ...methodList];
  return [...ApiClientInterface.create(factory, list, option), Class.create(factory, members)];
};
