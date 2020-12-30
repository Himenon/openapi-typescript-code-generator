import { generateComment } from "./utils";
import ts from "typescript";
import * as ModuleBlock from "./ModuleBlock";

export interface FindStatementParams {
  node: ts.ModuleDeclaration;
  name: string;
}

export interface CreateParams {
  export?: true;
  name: string;
  statements: ts.Statement[];
  comment?: string;
  deprecated?: boolean;
}

export interface CreateMultiParams extends Omit<CreateParams, "name"> {
  names: string[];
}
export interface UpdateParams {
  node: ts.ModuleDeclaration;
  statements: ts.Statement[];
}

export interface Factory {
  create: (params: CreateParams) => ts.ModuleDeclaration;
  findNamespace: (params: FindStatementParams) => ts.Statement | undefined;
  createMultiple: (params: CreateMultiParams) => ts.ModuleDeclaration;
  update: (params: UpdateParams) => ts.ModuleDeclaration;
  addStatements: (params: UpdateParams) => ts.ModuleDeclaration;
}

// eslint-disable-next-line no-unused-vars
export const findStatement = (context: ts.TransformationContext): Factory["findNamespace"] => (
  params: FindStatementParams,
): ts.Statement | undefined => {
  let statement: ts.Statement | undefined;
  params.node.forEachChild(node => {
    if (ts.isModuleDeclaration(node) && node.name.text === params.name) {
      statement = node;
    }
  });
  return statement;
};

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

export const createMultiple = (context: ts.TransformationContext): Factory["createMultiple"] => (
  params: CreateMultiParams,
): ts.ModuleDeclaration => {
  const names = params.names.reverse();
  const firstName = names[0];
  const restNames = names.slice(1, names.length);
  const child = create(context)({
    export: true,
    name: firstName,
    statements: params.statements,
    comment: params.comment,
    deprecated: params.deprecated,
  });
  return restNames.reduce<ts.ModuleDeclaration>((previousStatement, currentName) => {
    return create(context)({
      export: true,
      name: currentName,
      statements: [previousStatement],
    });
  }, child);
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
    findNamespace: findStatement(context),
    create: create(context),
    update: update(context),
    createMultiple: createMultiple(context),
    addStatements: addStatements(context),
  };
};
