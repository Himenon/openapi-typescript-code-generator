import ts from "typescript";

const generateExpression = (factory: ts.NodeFactory) => {
  return {
    this: factory.createThis(),
  };
};

export interface Params$Create {
  expression: string | "this" | ts.Expression;
  name: string;
}

export interface Factory {
  create: (params: Params$Create) => ts.PropertyAccessExpression;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.PropertyAccessExpression => {
  let expression: ts.Expression = typeof params.expression === "string" ? factory.createIdentifier(params.expression) : params.expression;
  const expressionMap = generateExpression(factory);
  if (typeof params.expression === "string" && params.expression in expressionMap) {
    expression = generateExpression(factory)[params.expression as "this"];
  }
  const node = factory.createPropertyAccessExpression(expression, factory.createIdentifier(params.name));
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
