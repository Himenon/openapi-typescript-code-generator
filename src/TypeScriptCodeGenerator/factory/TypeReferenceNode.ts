import ts from "typescript";

export interface Params$Create {
  name: string;
  typeArguments?: readonly ts.TypeNode[];
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeReferenceNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeReferenceNode => {
  const node = factory.createTypeReferenceNode(factory.createIdentifier(params.name), params.typeArguments);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
