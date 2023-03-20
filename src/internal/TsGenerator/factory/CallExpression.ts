import ts from "typescript";

export interface Params$Create {
  expression: ts.Expression;
  typeArguments?: readonly ts.TypeNode[] | undefined;
  argumentsArray: readonly ts.Expression[];
}

export interface Factory {
  create: (params: Params$Create) => ts.CallExpression;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.CallExpression => {
    const node = factory.createCallExpression(params.expression, params.typeArguments, params.argumentsArray);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
