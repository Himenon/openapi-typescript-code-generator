import ts from "typescript";
import * as Reference from "./Reference";
import * as PathItem from "./PathItem";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import { SchemaOnlySupportError } from "../../Exception";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  pathItems: OpenApi.MapLike<string, OpenApi.PathItem | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.ModuleDeclaration[] = Object.entries(pathItems).map(([pathName, pathItem]) => {
    const name = pathName.replace("/", "$");
    if (Guard.isReference(pathItem)) {
      const reference = Reference.generate<OpenApi.PathItem | OpenApi.Reference>(entryPoint, currentPoint, pathItem);
      if (reference.type === "local") {
        if (reference.path !== "schemas") {
          throw new SchemaOnlySupportError(`The ref target only supports "schemas". The current target is "${reference.path}".`);
        }
        console.log(reference.name);
        throw new Error("これから");
      }
      if (Guard.isReference(reference.data)) {
        throw new Error("これから");
      }
      return PathItem.generateNamespace(entryPoint, reference.referencePoint, store, factory, name, reference.data);
    }
    return PathItem.generateNamespace(entryPoint, currentPoint, store, factory, name, pathItem);
  });
  return factory.Namespace.create({
    export: true,
    name: "PathItems",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
  });
};
