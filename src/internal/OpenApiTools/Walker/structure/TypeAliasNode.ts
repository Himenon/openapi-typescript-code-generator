import { Node as BaseNode } from "@himenon/path-oriented-data-structure";

export type Kind = "typeAlias";

export interface Params {
  name: string;
  value: string;
}

export class Item extends BaseNode<Kind> {
  public value: string;
  constructor(params: Params) {
    super("typeAlias", params.name);
    this.value = params.value;
  }
}
