import ts from "typescript";

const syntaxKinds = {
  keyof: ts.SyntaxKind.KeyOfKeyword,
  unique: ts.SyntaxKind.UniqueKeyword,
  readonly: ts.SyntaxKind.ReadonlyKeyword,
} as const;

export interface Params$Create {
  syntaxKind: keyof typeof syntaxKinds;
  type: ts.TypeNode;
}

export interface Factory {
  create: (params: Params$Create) => ts.TypeOperatorNode;
}

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.TypeOperatorNode => {
    const node = factory.createTypeOperatorNode(syntaxKinds[params.syntaxKind], params.type);
    return node;
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    create: create(context),
  };
};
