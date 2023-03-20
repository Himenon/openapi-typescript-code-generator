import ts from "typescript";

export interface Params$Create {
  members: readonly ts.TypeElement[] | undefined;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeLiteralNode;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.TypeLiteralNode => {
    const node = factory.createTypeLiteralNode(params.members);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
