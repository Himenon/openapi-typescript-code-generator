import type { Operator } from "@himenon/path-oriented-data-structure";

import * as OpenApiSchema from "./OpenApiSchema";
import * as Directory from "./Directory";

export { OpenApiSchema as AbstractDataStructure, Directory };

export type Kind = OpenApiSchema.Kind | Directory.Kind;

export type GetChild<T extends Kind> = T extends OpenApiSchema.Kind
  ? OpenApiSchema.Item
  : T extends Directory.Kind
  ? Directory.Item
  : never;

// Type Safe method
export const createGetChildByPaths = (operator: Operator<string>) => <T extends Kind>(path: string, kind: T): GetChild<T> | undefined => {
  return operator.getChildByPaths(path, kind) as GetChild<T> | undefined;
};

export type GetChildByPaths = <T extends Kind>(path: string, kind: T) => GetChild<T> | undefined;
