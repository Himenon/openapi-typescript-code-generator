import ts from "typescript";

export interface Params$Create {
  expression: ts.Expression;
  typeArguments?: readonly ts.TypeNode[] | undefined;
  argumentsArray: readonly ts.Expression[];
}

export interface Factory {
  create: (params: Params$Create) => ts.CallExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.CallExpression => {
  const node = factory.createCallExpression(params.expression, params.typeArguments, params.argumentsArray);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
