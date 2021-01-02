import { Factory } from "../../TypeScriptCodeGenerator";
import * as Guard from "./Guard";
import * as Header from "./Header";
import * as MediaType from "./MediaType";
import * as Reference from "./Reference";
import { Store } from "./store";
import * as ToTypeNode from "./toTypeNode";
import { OpenApi } from "./types";

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

  Object.entries(response.headers || {}).forEach(([name, header]) => {
    if (Guard.isReference(header)) {
      const reference = Reference.generate<OpenApi.Header>(entryPoint, currentPoint, header);
      if (reference.type === "local") {
        context.setReferenceHandler(reference);
        return factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "local") });
      } else if (reference.componentName) {
        store.addStatement(reference.path, {
          type: "interface",
          value: Header.generateInterface(entryPoint, reference.referencePoint, factory, reference.name, reference.data, context),
        });
        return store.addStatement(`${basePath}/Header/${name}`, {
          type: "typeAlias",
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: name,
            type: factory.TypeReferenceNode.create({ name: context.getReferenceName(currentPoint, reference.path, "remote") }),
          }),
        });
      }
      return store.addStatement(`${basePath}/Header/${name}`, {
        type: "interface",
        value: Header.generateInterface(entryPoint, currentPoint, factory, name, reference.data, context),
      });
    }
    store.addStatement(`${basePath}/Header/${name}`, {
      type: "interface",
      value: Header.generateInterface(entryPoint, currentPoint, factory, name, header, context),
    });
  });
};
