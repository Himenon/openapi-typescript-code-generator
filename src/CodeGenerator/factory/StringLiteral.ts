import ts from "typescript";

export interface Params {
  text: string;
  isSingleQuote?: boolean;
}

export interface Factory {
  create: (params: Params) => ts.StringLiteral;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.StringLiteral => {
  const node = factory.createStringLiteral(params.text, params.isSingleQuote);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
