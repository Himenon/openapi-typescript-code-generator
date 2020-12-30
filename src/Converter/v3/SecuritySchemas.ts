import ts from "typescript";
import * as Reference from "./Reference";
import * as SecuritySchema from "./SecuritySchema";
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
  requestBodies: OpenApi.MapLike<string, OpenApi.SecuritySchema | OpenApi.Reference>,
): ts.ModuleDeclaration => {
  const statements: ts.InterfaceDeclaration[] = Object.entries(requestBodies).reduce<ts.InterfaceDeclaration[]>(
    (previous, [name, requestBody]) => {
      if (Guard.isReference(requestBody)) {
        const reference = Reference.generate<OpenApi.SecuritySchema | OpenApi.Reference>(entryPoint, currentPoint, requestBody);
        if (reference.type === "local") {
          if (!store.hasStatement(reference.path, "interface")) {
            throw new UndefinedComponent(`Reference "${requestBody.$ref}" did not found in ${reference.path} by ${reference.name}`);
          }
          return previous;
        }
        if (Guard.isReference(reference.data)) {
          throw new Error("これから");
        }
        previous.push(SecuritySchema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data));
        return previous;
      }
      previous.push(SecuritySchema.generateInterface(entryPoint, currentPoint, factory, name, requestBody));
      return previous;
    },
    [],
  );
  return factory.Namespace.create({
    export: true,
    name: "SecuritySchemas",
    statements,
    comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#securitySchemeObject`,
  });
};
