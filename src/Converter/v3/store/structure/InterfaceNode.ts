import { Node as BaseNode } from "@himenon/path-oriented-data-structure";
import ts from "typescript";

export type Kind = "interface";

export interface Params {
  name: string;
  value: ts.InterfaceDeclaration;
}

export class Item extends BaseNode<Kind> {
  public value: ts.InterfaceDeclaration;
  constructor(params: Params) {
    super("interface", params.name);
    this.value = params.value;
  }
}
