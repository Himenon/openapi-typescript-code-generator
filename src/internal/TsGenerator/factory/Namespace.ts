import ts from "typescript";

import * as ModuleBlock from "./ModuleBlock";
import { generateComment } from "./utils";

export interface Params$FindStatement {
  node: ts.ModuleDeclaration;
  name: string;
}

export interface Params$Create {
  export?: true;
  name: string;
  statements: ts.Statement[];
  comment?: string;
  deprecated?: boolean;
}

export interface Params$CreateMulti extends Omit<Params$Create, "name"> {
  names: string[];
}
export interface Params$Update {
  node: ts.ModuleDeclaration;
  statements: ts.Statement[];
}

export interface Factory {
  create: (params: Params$Create) => ts.ModuleDeclaration;
  findNamespace: (params: Params$FindStatement) => ts.Statement | undefined;
  createMultiple: (params: Params$CreateMulti) => ts.ModuleDeclaration;
  update: (params: Params$Update) => ts.ModuleDeclaration;
  addStatements: (params: Params$Update) => ts.ModuleDeclaration;
}

// eslint-disable-next-line no-unused-vars
export const findStatement =
  (_context: Pick<ts.TransformationContext, "factory">): Factory["findNamespace"] =>
  (params: Params$FindStatement): ts.Statement | undefined => {
    let statement: ts.Statement | undefined;
    params.node.forEachChild(node => {
      if (ts.isModuleDeclaration(node) && node.name.text === params.name) {
        statement = node;
      }
    });
    return statement;
  };

export const create =
  ({ factory }: Pick<ts.TransformationContext, "factory">): Factory["create"] =>
  (params: Params$Create): ts.ModuleDeclaration => {
    const node = factory.createModuleDeclaration(
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

export const createMultiple =
  (context: Pick<ts.TransformationContext, "factory">): Factory["createMultiple"] =>
  (params: Params$CreateMulti): ts.ModuleDeclaration => {
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

export const update =
  (context: Pick<ts.TransformationContext, "factory">): Factory["update"] =>
  (params: Params$Update): ts.ModuleDeclaration => {
    const { factory } = context;
    const { node, statements } = params;
    if (node.body && ts.isModuleBlock(node.body)) {
      const body = ModuleBlock.update(context)({ node: node.body, statements });
      return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, body);
    }
    return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, node.body);
  };

export const addStatements =
  (context: Pick<ts.TransformationContext, "factory">): Factory["addStatements"] =>
  (params: Params$Update): ts.ModuleDeclaration => {
    const { factory } = context;
    const { node, statements } = params;
    if (node.body && ts.isModuleBlock(node.body)) {
      const body = ModuleBlock.update(context)({ node: node.body, statements: node.body.statements.concat(statements) });
      return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, body);
    }
    return factory.updateModuleDeclaration(node, node.decorators, node.modifiers, node.name, node.body);
  };

export const make = (context: Pick<ts.TransformationContext, "factory">): Factory => {
  return {
    findNamespace: findStatement(context),
    create: create(context),
    update: update(context),
    createMultiple: createMultiple(context),
    addStatements: addStatements(context),
  };
};
