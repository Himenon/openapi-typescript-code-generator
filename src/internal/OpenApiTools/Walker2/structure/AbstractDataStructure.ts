import { Node as BaseNode } from "@himenon/path-oriented-data-structure";

import type { AbstractStruct } from "../../../../types";

export type Kind = "abstract-data";
export const Kind: Kind = "abstract-data";

export interface Property {
  name: string;
  value: AbstractStruct.SchemaLocation;
}

export class Item extends BaseNode<Kind> {
  public value: AbstractStruct.SchemaLocation;
  constructor(property: Property) {
    super("abstract-data", property.name);
    this.value = property.value;
  }
}
