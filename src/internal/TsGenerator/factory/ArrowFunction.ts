import ts from "typescript";

export interface Params$Create {
  typeParameters: ts.TypeParameterDeclaration[] | undefined;
  parameters: ts.ParameterDeclaration[];
  type?: ts.TypeNode;
  equalsGreaterThanToken?: ts.EqualsGreaterThanToken;
  body: ts.ConciseBody;
}

export interface Factory {
  create: (params: Params$Create) => ts.ArrowFunction;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.ArrowFunction => {
    const node = factory.createArrowFunction(
      undefined,
      params.typeParameters,
      params.parameters,
      params.type,
      params.equalsGreaterThanToken,
      params.body,
    );
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
