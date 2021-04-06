import { Operator } from "@himenon/path-oriented-data-structure";

import * as DataStructure from "./DataStructure";
import * as InterfaceNode from "./InterfaceNode";
import * as NamespaceTree from "./NamespaceTree";
import * as TypeAliasNode from "./TypeAliasNode";

export { DataStructure, InterfaceNode, NamespaceTree, TypeAliasNode };

export interface NamespaceTreeParams extends NamespaceTree.Params {
  kind: NamespaceTree.Kind;
}

export interface InterfaceNodeParams extends InterfaceNode.Params {
  kind: InterfaceNode.Kind;
}

export interface TypeAliasNodeParams extends TypeAliasNode.Params {
  kind: TypeAliasNode.Kind;
}

export type ComponentParams = NamespaceTreeParams | InterfaceNodeParams | TypeAliasNodeParams;

export type Instance = NamespaceTree.Item | InterfaceNode.Item | TypeAliasNode.Item;

export const createInstance = (component: ComponentParams): Instance => {
  if (component.kind === "interface") {
    return new InterfaceNode.Item(component);
  }
  if (component.kind === "typeAlias") {
    return new TypeAliasNode.Item(component);
  }
  if (component.kind === "namespace") {
    return new NamespaceTree.Item(component);
  }
  throw new Error("not registers");
};

export const create = () => {
  const operator = new Operator<NamespaceTree.Kind>("namespace");
  return {
    operator,
    getChildByPaths: DataStructure.createGetChildByPaths(operator),
  };
};
