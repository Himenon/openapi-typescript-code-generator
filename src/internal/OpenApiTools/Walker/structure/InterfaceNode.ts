import { Node as BaseNode } from "@himenon/path-oriented-data-structure";
<<<<<<< HEAD
=======
import type ts from "typescript";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

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
