import * as path from "path";

import { Factory } from "../../../CodeGenerator";
import * as Name from "../Name";
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
    name,
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
      name: Name.ComponentChild.Header,
      value: Header.generateInterface(entryPoint, currentPoint, factory, Name.ComponentChild.Header, response.headers, context),
    });
  }

  if (response.content) {
    store.addStatement(`${basePath}/Content`, {
      type: "interface",
      name: Name.ComponentChild.Content,
      value: MediaType.generateInterface(entryPoint, currentPoint, factory, Name.ComponentChild.Content, response.content, context),
    });
  }
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
    name: nameWithStatusCode,
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
      name: Name.ComponentChild.Header,
      value: factory.Namespace.create({
        export: true,
        name: Name.ComponentChild.Header,
        statements: [],
      }),
      statements: {},
    });
    Object.values(headerNamespace.statements).forEach(statement => {
      if (!statement) {
        return;
      }
      if (statement.type === "interface" || statement.type === "typeAlias") {
        const aliasName = [referenceNamespaceName, Name.ComponentChild.Header, statement.name].join(".");
        store.addStatement(`${basePath}/Header/${statement.value.name.text}`, {
          type: "typeAlias",
          name: aliasName,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: statement.value.name.text,
            type: factory.TypeReferenceNode.create({
              name: aliasName,
            }),
          }),
        });
      }
    });
  }
  store.addStatement(`${basePath}/Content`, {
    type: "typeAlias",
    name: Name.ComponentChild.Content,
    value: factory.TypeAliasDeclaration.create({
      export: true,
      name: Name.ComponentChild.Content,
      type: factory.TypeReferenceNode.create({
        name: referenceNamespaceName + "." + Name.ComponentChild.Content, // TODO Contextから作成？
      }),
    }),
  });
};
