import type { Operator } from "@himenon/path-oriented-data-structure";

import * as InterfaceNode from "./InterfaceNode";
import * as NamespaceTree from "./NamespaceTree";
import * as TypeAliasNode from "./TypeAliasNode";

export { InterfaceNode, NamespaceTree, TypeAliasNode };

export type Kind = NamespaceTree.Kind | InterfaceNode.Kind | TypeAliasNode.Kind;

export type GetChild<T extends Kind> = T extends NamespaceTree.Kind
  ? NamespaceTree.Item
  : T extends InterfaceNode.Kind
  ? InterfaceNode.Item
  : T extends TypeAliasNode.Kind
  ? TypeAliasNode.Item
  : never;

// Type Safe method
export const createGetChildByPaths = (operator: Operator<string>) => <T extends Kind>(path: string, kind: T): GetChild<T> | undefined => {
  return operator.getChildByPaths(path, kind) as GetChild<T> | undefined;
};
