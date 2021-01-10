import ts from "typescript";

export interface Params {
  name: string;
}

export interface Factory {
  create: (params: Params) => ts.Identifier;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.Identifier => {
  const node = factory.createIdentifier(params.name);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
