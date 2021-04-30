import { Operator, Node as BaseNode } from "@himenon/path-oriented-data-structure";
import * as ADS from "../../../AbstractDataStructure";

import * as DataStructure from "./DataStructure";

export type Kind = "typedef";

export interface Params {
  name: string;
  value: ADS.Struct;
}

export class TypeDefItem extends BaseNode<Kind> {
  public value: ADS.Struct;
  constructor(params: Params) {
    super("typedef", params.name);
    this.value = params.value;
  }
}


export const create = () => {
  const operator = new Operator("typedef");
  return {
    operator,
    getChildByPaths: DataStructure.createGetChildByPaths(operator),
  };
};

export type OperatorType = Operator<"typedef">;

export type GetChildByPaths = DataStructure.GetChildByPaths;
