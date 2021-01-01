import ts from "typescript";

export interface Params$Create {
  export?: true;
  name: string;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeReferenceNode;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeReferenceNode => {
  const node = factory.createTypeReferenceNode(factory.createIdentifier(params.name), undefined);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
