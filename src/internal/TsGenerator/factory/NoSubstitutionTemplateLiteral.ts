import ts from "typescript";

export interface Params {
  text: string;
  rawText?: string;
}

export interface Factory {
  create: (params: Params) => ts.NoSubstitutionTemplateLiteral;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params): ts.NoSubstitutionTemplateLiteral => {
    const node = factory.createNoSubstitutionTemplateLiteral(params.text, params.rawText);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
