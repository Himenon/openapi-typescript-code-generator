import ts from "typescript";

export interface Params$Create {
  expression: ts.Expression;
  index: number | string | ts.Expression;
}

export interface Factory {
  create: (params: Params$Create) => ts.ElementAccessExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.ElementAccessExpression => {
  const index = typeof params.index === "string" ? factory.createStringLiteral(params.index) : params.index;
  const node = factory.createElementAccessExpression(params.expression, index);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
