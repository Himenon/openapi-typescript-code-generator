import ts from "typescript";

const operators = {
  "+": ts.SyntaxKind.PlusToken,
  "=": ts.SyntaxKind.EqualsToken,
} as const;

export interface Params {
  left: ts.Expression;
  operator: keyof typeof operators;
  right: ts.Expression;
}

export interface Factory {
  create: (params: Params) => ts.BinaryExpression;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (params: Params): ts.BinaryExpression => {
  const node = factory.createBinaryExpression(params.left, operators[params.operator], params.right);
  return node;
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
