import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as MediaType from "./MediaType";
import * as ToTypeNode from "./toTypeNode";
import { Store } from "./store";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  name: string,
  requestBody: OpenApi.RequestBody,
  context: ToTypeNode.Context,
): void => {
  const contentSignatures = MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, requestBody.content || {}, context);

  store.addStatement(`components/requestBodies/${name}`, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name,
      comment: requestBody.description,
      statements: [
        factory.Interface({
          export: true,
          name: "Content",
          members: contentSignatures,
          comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#requestBodyObject`,
        }),
      ],
    }),
    statements: {},
  });
};
