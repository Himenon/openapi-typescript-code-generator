import ts from "typescript";

export interface Params$Create {
  name: string;
  modifiers?: "private" | "public";
  type?: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.ParameterDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.ParameterDeclaration => {
  const modifiers = (() => {
    if (params.modifiers === "private") {
      return [factory.createModifier(ts.SyntaxKind.PrivateKeyword)];
    }
    if (params.modifiers === "public") {
      return [factory.createModifier(ts.SyntaxKind.PublicKeyword)];
    }
    return;
  })();
  const node = factory.createParameterDeclaration(
    undefined,
    modifiers,
    undefined,
    factory.createIdentifier(params.name),
    undefined,
    params.type,
    undefined,
  );
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
