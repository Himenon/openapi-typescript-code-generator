import ts from "typescript";

export interface Params {
  text: string;
  rawText?: string;
}

export interface Factory {
  create: (params: Params) => ts.TemplateTail;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params): ts.TemplateTail => {
  const node = factory.createTemplateTail(params.text, params.rawText);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
