import ts from "typescript";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export interface Factory {
  create: (params: Params) => ts.UnionTypeNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.UnionTypeNode => {
  const node = factory.createUnionTypeNode(params.typeNodes);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
