import ts from "typescript";

import { Factory } from "../../../TypeScriptCodeGenerator";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";

export const generateTypeNode = (
  entryPoint: string,
  currentPoint: string,
  factory: Factory.Type,
  name: string,
  header: OpenApi.Header,
  context: ToTypeNode.Context,
): ts.TypeAliasDeclaration => {
  return factory.TypeAliasDeclaration.create({
    export: true,
    name,
    type: ToTypeNode.convert(entryPoint, currentPoint, factory, header.schema || { type: "null" }, context),
  });
};
