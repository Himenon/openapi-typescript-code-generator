import * as path from "path";

import { Factory } from "../../../TypeScriptCodeGenerator";
import { Def, State, Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Header from "./Header";
import * as MediaType from "./MediaType";

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
  store.addStatement(basePath, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: name,
      comment: response.description,
      statements: [],
    }),
    statements: {},
  });

  if (response.headers) {
    store.addStatement(`${basePath}/Header`, {
      type: "interface",
      value: Header.generateInterface(entryPoint, currentPoint, factory, "Header", response.headers, context),
    });
  }

  if (response.content) {
    store.addStatement(`${basePath}/Content`, {
      type: "interface",
      value: MediaType.generateInterface(entryPoint, currentPoint, factory, "Content", response.content, context),
    });
  }

  console.log(`------ End: Response Namespace ------`);
};

export const generateReferenceNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  parentPath: string,
  nameWithStatusCode: string,
  responseReference: { name: string; path: string },
  context: ToTypeNode.Context,
): void => {
  const basePath = `${parentPath}/${nameWithStatusCode}`;
  const referenceNamespaceName = context.getReferenceName(currentPoint, responseReference.path, "remote");
  store.addStatement(basePath, {
    type: "namespace",
    value: factory.Namespace.create({
      export: true,
      name: nameWithStatusCode,
      statements: [],
    }),
    statements: {},
  });
  // TODO Type Guard
  const headerNamespace = store.getStatement(path.join(responseReference.path, "Header"), "namespace") as
    | Def.NamespaceStatement<State.A, State.B, State.C>
    | undefined;
  if (headerNamespace) {
    store.addStatement(`${basePath}/Header`, {
      type: "namespace",
      value: factory.Namespace.create({
        export: true,
        name: "Header",
        statements: [],
      }),
      statements: {},
    });
    Object.values(headerNamespace.statements).forEach(statement => {
      if (!statement) {
        return;
      }
      if (statement.type === "interface" || statement.type === "typeAlias") {
        store.addStatement(`${basePath}/Header/${statement.value.name.text}`, {
          type: "typeAlias",
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: statement.value.name.text,
            type: factory.TypeReferenceNode.create({
              name: [referenceNamespaceName, "Header", statement.value.name.text].join("."),
            }),
          }),
        });
      }
    });
  }
  store.addStatement(`${basePath}/Content`, {
    type: "typeAlias",
    value: factory.TypeAliasDeclaration.create({
      export: true,
      name: "Content",
      type: factory.TypeReferenceNode.create({
        name: referenceNamespaceName + ".Content",
      }),
    }),
  });
};
