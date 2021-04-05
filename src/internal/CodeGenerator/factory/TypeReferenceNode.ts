import ts from "typescript";

export interface Params$Create {
  name: string;
  typeArguments?: readonly ts.TypeNode[];
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeReferenceNode;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params$Create): ts.TypeReferenceNode => {
  const node = factory.createTypeReferenceNode(factory.createIdentifier(params.name), params.typeArguments);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
