import { Factory } from "../../../CodeGenerator";
import { UndefinedComponent } from "../../../Exception";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import { OpenApi } from "../types";
import * as Reference from "./Reference";
import * as SecuritySchema from "./SecuritySchema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestBodies: OpenApi.MapLike<string, OpenApi.SecuritySchema | OpenApi.Reference>,
): void => {
  store.addComponent("securitySchemes", {
    type: "namespace",
    name: Name.Components.SecuritySchemas,
    value: factory.Namespace.create({
      export: true,
      name: Name.Components.SecuritySchemas,
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
        name,
        value: SecuritySchema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data),
      });
    }
    const path = `components/securitySchemes/${name}`;
    return store.addStatement(path, {
      type: "interface",
      name: name,
      value: SecuritySchema.generateInterface(entryPoint, currentPoint, factory, name, requestBody),
    });
  });
};
