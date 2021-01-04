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

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: Params$Create): ts.TypeOperatorNode => {
  const node = factory.createTypeOperatorNode(syntaxKinds[params.syntaxKind], params.type);
  return node;
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
  };
};
