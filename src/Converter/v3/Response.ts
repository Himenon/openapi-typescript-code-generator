import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Header from "./Header";
import * as MediaType from "./MediaType";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";
import { FeatureDevelopmentError } from "../../Exception";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  name: string,
  response: OpenApi.Response,
  context: ToTypeNode.Context,
): void => {
  const basePath = `${parentPath}/${name}`;
  store.addStatement(`${basePath}`, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name,
      comment: response.description,
      statements: [],
    }),
    statements: {},
  });

  Object.entries(response.headers || {}).forEach(([key, header]) => {
    if (Guard.isReference(header)) {
      throw new FeatureDevelopmentError("対応中");
    }
    store.addStatement(`${basePath}/Header/${key}`, {
      type: "interface",
      value: Header.generateInterface(entryPoint, currentPoint, factory, key, header, context),
    });
  });

  store.addStatement(`${basePath}/Header`, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Header",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
    }),
    statements: {},
  });

  store.addStatement(`${basePath}/Content`, {
    type: "interface",
    value: factory.Interface({
      export: true,
      name: "Content",
      members: MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, response.content || {}, context),
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#mediaTypeObject`,
    }),
  });
};
