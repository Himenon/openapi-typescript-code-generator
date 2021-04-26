import type { OpenApi } from "../../../types";
import { UndefinedComponent } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import type * as Walker from "../Walker";
import * as Reference from "./Reference";
import * as SecuritySchema from "./SecuritySchema";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Walker.Store,
  factory: Factory.Type,
  requestBodies: Record<string, OpenApi.SecuritySchema | OpenApi.Reference>,
): void => {
  store.addComponent("securitySchemes", {
    kind: "namespace",
    name: Name.Components.SecuritySchemas,
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
        kind: "interface",
        name,
        value: SecuritySchema.generateInterface(entryPoint, reference.referencePoint, factory, name, reference.data),
      });
    }
    const path = `components/securitySchemes/${name}`;
    return store.addStatement(path, {
      kind: "interface",
      name: name,
      value: SecuritySchema.generateInterface(entryPoint, currentPoint, factory, name, requestBody),
    });
  });
};
