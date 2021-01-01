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
): void => {
  store.addComponent("securitySchemes", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "SecuritySchemas",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#securitySchemeObject`,
    }),
    statements: {},
  });
  Object.entries(requestBodies).forEach(([name, requestBody]) => {
    if (Guard.isReference(requestBody)) {
      const reference = Reference.generate<OpenApi.SecuritySchema>(entryPoint, currentPoint, requestBody);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.path, ["interface"])) {
          throw new UndefinedComponent(`Reference "${requestBody.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
        return;
      }
      const path = `components/securitySchemes/${reference.name}`;
      return store.addStatement(path, {
        type: "interface",
        value: SecuritySchema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data),
      });
    }
    const path = `components/securitySchemes/${name}`;
    return store.addStatement(path, {
      type: "interface",
      value: SecuritySchema.generateInterface(entryPoint, currentPoint, factory, name, requestBody),
    });
  });
};
