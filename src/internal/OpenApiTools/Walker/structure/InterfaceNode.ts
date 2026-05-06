import { Node as BaseNode } from "@himenon/path-oriented-data-structure";

export type Kind = "interface";

export interface Params {
  name: string;
  value: string;
}

export class Item extends BaseNode<Kind> {
  public value: string;
  constructor(params: Params) {
    super("interface", params.name);
    this.value = params.value;
  }
}
