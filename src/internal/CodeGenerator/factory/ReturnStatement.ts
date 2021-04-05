import ts from "typescript";

export interface Params$Create {
  expression?: ts.Expression;
}

export interface Factory {
  create: (params: Params$Create) => ts.ReturnStatement;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params$Create): ts.ReturnStatement => {
  const node = factory.createReturnStatement(params.expression);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
