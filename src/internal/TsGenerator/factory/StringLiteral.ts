import ts from "typescript";

export interface Params {
  text: string;
  isSingleQuote?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.StringLiteral;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.StringLiteral => {
    const node = factory.createStringLiteral(params.text, params.isSingleQuote);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
