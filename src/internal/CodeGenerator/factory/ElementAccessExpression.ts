import ts from "typescript";

export interface Params$Create {
  expression: ts.Expression;
  index: number | string | ts.Expression;
}

export interface Factory {
  create: (params: Params$Create) => ts.ElementAccessExpression;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (
  params: Params$Create,
): ts.ElementAccessExpression => {
  const index = typeof params.index === "string" ? factory.createStringLiteral(params.index) : params.index;
  const node = factory.createElementAccessExpression(params.expression, index);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
