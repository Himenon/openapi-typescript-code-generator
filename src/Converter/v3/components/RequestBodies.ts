import { Factory } from "../../../TypeScriptCodeGenerator";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";
import * as RequestBody from "./RequestBody";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestBodies: OpenApi.MapLike<string, OpenApi.RequestBody | OpenApi.Reference>,
  context: ToTypeNode.Context,
): void => {
  const basePath = "components/requestBodies";
  store.addComponent("requestBodies", {
    type: "namespace",
    name: Name.Components.RequestBodies,
    value: factory.Namespace.create({
      export: true,
      name: Name.Components.RequestBodies,
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#componentsObject`,
    }),
    statements: {},
  });

  Object.entries(requestBodies).forEach(([name, requestBody]) => {
    if (Guard.isReference(requestBody)) {
      const reference = Reference.generate<OpenApi.MapLike<string, OpenApi.RequestBody>>(entryPoint, currentPoint, requestBody);
      if (reference.type === "local") {
        return factory.TypeReferenceNode.create({
          name: reference.name,
        });
      }
      return generateNamespace(entryPoint, reference.referencePoint, store, factory, reference.data, context);
    }
    RequestBody.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, requestBody, context);
  });
};
