import ts from "typescript";

export interface Params$Create {
  objectType: ts.TypeNode;
  indexType: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.IndexedAccessTypeNode;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.IndexedAccessTypeNode => {
    const node = factory.createIndexedAccessTypeNode(params.objectType, params.indexType);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
