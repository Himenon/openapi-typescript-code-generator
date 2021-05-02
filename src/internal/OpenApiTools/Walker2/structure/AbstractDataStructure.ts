import { Node as BaseNode } from "@himenon/path-oriented-data-structure";

import * as ADS from "../../../AbstractDataStructure";

export type Kind = "abstract-data";
export const Kind: Kind = "abstract-data";

export interface Property {
  name: string;
  value: ADS.Struct;
}

export class Item extends BaseNode<Kind> {
  public value: ADS.Struct;
  constructor(property: Property) {
    super("abstract-data", property.name);
    this.value = property.value;
  }
}
