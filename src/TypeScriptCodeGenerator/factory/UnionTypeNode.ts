import ts from "typescript";

export interface Params {
  typeNodes: ts.TypeNode[];
}

export type Factory = (params: Params) => ts.UnionTypeNode;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.UnionTypeNode => {
  const node = factory.createUnionTypeNode(params.typeNodes);
  return node;
};
