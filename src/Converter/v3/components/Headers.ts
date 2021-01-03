import { UndefinedComponent } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Header from "./Header";
import * as Reference from "./Reference";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  headers: OpenApi.MapLike<string, OpenApi.Header | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  store.addComponent("headers", {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Headers",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
    }),
    statements: {},
  });
  Object.entries(headers).forEach(([name, header]) => {
    if (Guard.isReference(header)) {
      const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
      if (reference.type === "local") {
        if (!store.hasStatement(reference.path, ["interface"])) {
          throw new UndefinedComponent(`Reference "${header.$ref}" did not found in ${reference.path} by ${reference.name}`);
        }
      } else if (reference.type === "remote") {
        store.addStatement(reference.path, {
          type: "interface",
          value: Header.generateInterface(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
        });
      }
    } else {
      store.addStatement(`components/headers/${name}`, {
        type: "interface",
        value: Header.generateInterface(entryPoint, currentPoint, factory, name, header, context),
      });
    }
  });
};
