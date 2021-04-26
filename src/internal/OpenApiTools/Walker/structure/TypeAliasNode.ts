import { Node as BaseNode } from "@himenon/path-oriented-data-structure";
import ts from "typescript";

export type Kind = "typeAlias";

export interface Params {
  name: string;
  value: ts.TypeAliasDeclaration;
}

export class Item extends BaseNode<Kind> {
  public value: ts.TypeAliasDeclaration;
  constructor(params: Params) {
    super("typeAlias", params.name);
    this.value = params.value;
  }
}
