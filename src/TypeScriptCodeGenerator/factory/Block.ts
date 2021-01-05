import ts from "typescript";

export interface Params$Create {
  statements: readonly ts.Statement[];
  multiLine: boolean;
}

export interface Factory {
  create: (params: Params$Create) => ts.Block;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.Block => {
  const node = factory.createBlock(params.statements, params.multiLine);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
