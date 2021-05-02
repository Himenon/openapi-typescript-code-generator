import type { Operator } from "@himenon/path-oriented-data-structure";

import * as AbstractDataStructure from "./AbstractDataStructure";
import * as Directory from "./Directory";

export { AbstractDataStructure, Directory };

export type Kind = AbstractDataStructure.Kind | Directory.Kind;

export type GetChild<T extends Kind> = T extends AbstractDataStructure.Kind
  ? AbstractDataStructure.Item
  : T extends Directory.Kind
  ? Directory.Item
  : never;

// Type Safe method
export const createGetChildByPaths = (operator: Operator<string>) => <T extends Kind>(path: string, kind: T): GetChild<T> | undefined => {
  return operator.getChildByPaths(path, kind) as GetChild<T> | undefined;
};

export type GetChildByPaths = <T extends Kind>(path: string, kind: T) => GetChild<T> | undefined;
