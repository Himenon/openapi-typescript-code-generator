import * as ts from "typescript";

export interface Params {
  export: boolean;
  name: string;
  statements: ts.Statement[];
}

export const generate = ({ factory }: ts.TransformationContext, params: Params): ts.ModuleDeclaration => {
  return factory.createModuleDeclaration(
    undefined,
    params.export ? [factory.createModifier(ts.SyntaxKind.ExportKeyword)] : undefined,
    factory.createIdentifier(params.name),
    factory.createModuleBlock(params.statements),
    ts.NodeFlags.Namespace,
  );
};
