import ts from "typescript";

export interface Params {
  properties: ts.ObjectLiteralElementLike[];
  multiLine?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.ObjectLiteralExpression;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.ObjectLiteralExpression => {
    const node = factory.createObjectLiteralExpression(params.properties, params.multiLine);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
