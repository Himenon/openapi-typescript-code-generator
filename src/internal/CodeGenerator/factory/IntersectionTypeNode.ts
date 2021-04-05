import ts from "typescript";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export interface Factory {
  create: (params: Params) => ts.IntersectionTypeNode;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.IntersectionTypeNode => {
  const node = factory.createIntersectionTypeNode(params.typeNodes);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
