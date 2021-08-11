import ts from "typescript";

export interface Params$Create {
  text: string;
}

export interface Factory {
  create: (params: Params$Create) => ts.RegularExpressionLiteral;
}

export const create = ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] => (
  params: Params$Create,
): ts.RegularExpressionLiteral => {
  return factory.createRegularExpressionLiteral(params.text);
};

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
