import ts from "typescript";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export type Factory = (params: Params) => ts.IntersectionTypeNode;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.IntersectionTypeNode => {
  const node = factory.createIntersectionTypeNode(params.typeNodes);
  return node;
};
