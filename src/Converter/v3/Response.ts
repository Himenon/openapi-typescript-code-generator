import { OpenApi } from "./types";
import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Header from "./Header";
import * as MediaType from "./MediaType";
import { Store } from "./store";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  name: string,
  response: OpenApi.Response,
): void => {
  store.addStatement(`components/responses/${name}`, {
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
      throw new Error("対応中");
    }
    store.addStatement(`components/responses/Header/${key}`, {
      type: "interface",
      value: Header.generateInterface(entryPoint, currentPoint, factory, key, header),
    });
  });

  store.addStatement(`components/responses/${name}/Header`, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: "Header",
      statements: [],
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#headerObject`,
    }),
    statements: {},
  });

  store.addStatement(`components/responses/${name}/Content`, {
    type: "interface",
    value: factory.Interface({
      export: true,
      name: "Content",
      members: MediaType.generatePropertySignatures(entryPoint, currentPoint, factory, response.content || {}),
      comment: `@see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.1.0.md#mediaTypeObject`,
    }),
  });
};
