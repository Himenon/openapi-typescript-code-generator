import ts from "typescript";

export interface Params {
  name: string;
}

export interface Factory {
  create: (params: Params) => ts.Identifier;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.Identifier => {
  const node = factory.createIdentifier(params.name);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
