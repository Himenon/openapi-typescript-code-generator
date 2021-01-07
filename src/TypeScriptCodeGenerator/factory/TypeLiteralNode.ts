import ts from "typescript";

export interface Params$Create {
  members: readonly ts.TypeElement[] | undefined;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeLiteralNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeLiteralNode => {
  const node = factory.createTypeLiteralNode(params.members);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
