import ts from "typescript";

export interface Params$Create {
  expression: ts.Expression;
  argumentsArray: readonly ts.Expression[];
}

export interface Factory {
  create: (params: Params$Create) => ts.CallExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.CallExpression => {
  const node = factory.createCallExpression(params.expression, undefined, params.argumentsArray);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
