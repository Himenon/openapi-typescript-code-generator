import ts from "typescript";
import * as Reference from "./Reference";
import * as Header from "./Header";
import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import { Store } from "./store";
import { UndefinedComponent } from "../../Exception";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements = Object.entries(headers).reduce<ts.InterfaceDeclaration[]>((statements, [name, header]) => {
    if (Guard.isReference(header)) {
      const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.target, reference.name)) {
          throw new UndefinedComponent(`Reference "${header.$ref}" did not found in ${reference.target} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        if (reference.key) {
          statements.push(Header.generateInterface(entryPoint, reference.referencePoint, factory, reference.key, reference.data));
        }
      }
      return statements;
    }
    statements.push(Header.generateInterface(entryPoint, currentPoint, factory, name, header));

    return statements;
  }, []);
  return factory.Namespace.create({
    export: true,
    name: "Headers",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
  });
};
