import type * as PathOrientedDataStructure from "@himenon/path-oriented-data-structure";

import * as AbstractDataStructure from "../internal/AbstractDataStructure";

export type T = PathOrientedDataStructure.Operator<"typedef">;

export interface TypeDefNode extends PathOrientedDataStructure.Node<"typedef"> {
  value: AbstractDataStructure.Struct;
}

export type Kind = "typedef";

export type GetChild<T extends Kind> = T extends "typedef" ? TypeDefNode : never;
