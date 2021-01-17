import * as path from "path";

import { Factory } from "../../../CodeGenerator";
import * as Name from "../Name";
import { Store } from "../store";
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
    kind: "namespace",
    name,
    comment: response.description,
  });

  if (response.headers) {
    store.addStatement(`${basePath}/Header`, {
      kind: "interface",
      name: Name.ComponentChild.Header,
      value: Header.generateInterface(entryPoint, currentPoint, factory, Name.ComponentChild.Header, response.headers, context),
    });
  }

  if (response.content) {
    store.addStatement(`${basePath}/Content`, {
      kind: "interface",
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
  const referenceNamespaceName = context.resolveReferencePath(currentPoint, responseReference.path).name;
  store.addStatement(basePath, {
    kind: "namespace",
    name: nameWithStatusCode,
  });
  const headerNamespace = store.getStatement(path.join(responseReference.path, "Header"), "namespace");
  if (headerNamespace) {
    store.addStatement(`${basePath}/Header`, {
      kind: "namespace",
      name: Name.ComponentChild.Header,
    });
    Object.values(headerNamespace.getChildren()).forEach(statement => {
      if (!statement) {
        return;
      }
      if (statement.kind === "interface" || statement.kind === "typeAlias") {
        const aliasName = [referenceNamespaceName, Name.ComponentChild.Header, statement.name].join(".");
        store.addStatement(`${basePath}/Header/${statement.name}`, {
          kind: "typeAlias",
          name: aliasName,
          value: factory.TypeAliasDeclaration.create({
            export: true,
            name: statement.name,
            type: factory.TypeReferenceNode.create({
              name: aliasName,
            }),
          }),
        });
      }
    });
  }
  store.addStatement(`${basePath}/Content`, {
    kind: "typeAlias",
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
