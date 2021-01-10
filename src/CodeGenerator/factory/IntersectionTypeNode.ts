import ts from "typescript";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export interface Factory {
  create: (params: Params) => ts.IntersectionTypeNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.IntersectionTypeNode => {
  const node = factory.createIntersectionTypeNode(params.typeNodes);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
