import * as ts from "typescript";

export interface Params {
  export?: true;
  name: string;
  statements: ts.Statement[];
}

export type Factory = (params: Params) => ts.ModuleDeclaration;

export const create = ({ factory }: ts.TransformationContext): Factory => (params: Params): ts.ModuleDeclaration => {
  return factory.createModuleDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    factory.createModuleBlock(params.statements),
    ts.NodeFlags.Namespace,
  );
};
