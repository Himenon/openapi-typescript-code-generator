import { generateComment } from "./utils";
import ts from "typescript";
import * as ModuleBlock from "./ModuleBlock";

export interface CreateParams {
  export?: true;
  name: string;
  statements: ts.Statement[];
  comment?: string;
  deprecated?: boolean;
}

export interface UpdateParams {
  node: ts.ModuleDeclaration;
  statements: ts.Statement[];
}

export interface Factory {
  create: (params: CreateParams) => ts.ModuleDeclaration;
  update: (params: UpdateParams) => ts.ModuleDeclaration;
  addStatements: (params: UpdateParams) => ts.ModuleDeclaration;
}

export const create = ({ factory }: ts.TransformationContext): Factory["create"] => (params: CreateParams): ts.ModuleDeclaration => {
  const node = factory.createModuleDeclaration(
    undefined,
    params.export && [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createIdentifier(params.name),
    factory.createModuleBlock(params.statements),
    ts.NodeFlags.Namespace,
  );
  if (params.comment) {
    const comment = generateComment(params.comment, params.deprecated);
    return ts.addSyntheticLeadingComment(node, ts.SyntaxKind.MultiLineCommentTrivia, comment.value, comment.hasTrailingNewLine);
  }
  return node;
};

export const update = (context: ts.TransformationContext): Factory["update"] => (params: UpdateParams): ts.ModuleDeclaration => {
  const { factory } = context;
  const { node, statements } = params;
  if (node.body && ts.isModuleBlock(node.body)) {
    const body = ModuleBlock.update(context)({ node: node.body, statements });
    return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, body);
  }
  return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, node.body);
};

export const addStatements = (context: ts.TransformationContext): Factory["addStatements"] => (params: UpdateParams): ts.ModuleDeclaration => {
  const { factory } = context;
  const { node, statements } = params;
  if (node.body && ts.isModuleBlock(node.body)) {
    const body = ModuleBlock.update(context)({ node: node.body, statements: node.body.statements.concat(statements) });
    return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, body);
  }
  return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, node.body);
};

export const make = (context: ts.TransformationContext): Factory => {
  return {
    create: create(context),
    update: update(context),
    addStatements: update(context),
  };
};
