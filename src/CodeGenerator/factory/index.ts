import ts from "typescript";

import * as BinaryExpression from "./BinaryExpression";
import * as Block from "./Block";
import * as CallExpression from "./CallExpression";
import * as ClassDeclaration from "./ClassDeclaration";
import * as ConstructorDeclaration from "./ConstructorDeclaration";
import * as ElementAccessExpression from "./ElementAccessExpression";
import * as FunctionTypeNode from "./FunctionTypeNode";
import * as Identifier from "./Identifier";
import * as IndexedAccessTypeNode from "./IndexedAccessTypeNode";
import * as IndexSignatureDeclaration from "./IndexSignatureDeclaration";
import * as InterfaceDeclaration from "./InterfaceDeclaration";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as MethodDeclaration from "./MethodDeclaration";
import * as Namespace from "./Namespace";
import * as NoSubstitutionTemplateLiteral from "./NoSubstitutionTemplateLiteral";
import * as ObjectLiteralExpression from "./ObjectLiteralExpression";
import * as ParameterDeclaration from "./ParameterDeclaration";
import * as PropertyAccessExpression from "./PropertyAccessExpression";
import * as PropertyAssignment from "./PropertyAssignment";
import * as PropertySignature from "./PropertySignature";
import * as ReturnStatement from "./ReturnStatement";
import * as StringLiteral from "./StringLiteral";
import * as TemplateExpression from "./TemplateExpression";
import * as TemplateHead from "./TemplateHead";
import * as TemplateMiddle from "./TemplateMiddle";
import * as TemplateSpan from "./TemplateSpan";
import * as TemplateTail from "./TemplateTail";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as TypeLiteralNode from "./TypeLiteralNode";
import * as TypeNode from "./TypeNode";
import * as TypeOperatorNode from "./TypeOperatorNode";
import * as TypeParameterDeclaration from "./TypeParameterDeclaration";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as UnionTypeNode from "./UnionTypeNode";
import * as VariableDeclaration from "./VariableDeclaration";
import * as VariableDeclarationList from "./VariableDeclarationList";
import * as VariableStatement from "./VariableStatement";

export interface Type {
  Block: Block.Factory;
  ClassDeclaration: ClassDeclaration.Factory;
  InterfaceDeclaration: InterfaceDeclaration.Factory;
  ParameterDeclaration: ParameterDeclaration.Factory;
  IndexedAccessTypeNode: IndexedAccessTypeNode.Factory;
  MethodDeclaration: MethodDeclaration.Factory;
  TypeOperatorNode: TypeOperatorNode.Factory;
  Namespace: Namespace.Factory;
  PropertySignature: PropertySignature.Factory;
  TypeAliasDeclaration: TypeAliasDeclaration.Factory;
  TypeNode: TypeNode.Factory;
  LiteralTypeNode: LiteralTypeNode.Factory;
  IndexSignatureDeclaration: IndexSignatureDeclaration.Factory;
  UnionTypeNode: UnionTypeNode.Factory;
  IntersectionTypeNode: IntersectionTypeNode.Factory;
  TypeReferenceNode: TypeReferenceNode.Factory;
  TypeParameterDeclaration: TypeParameterDeclaration.Factory;
  ConstructorDeclaration: ConstructorDeclaration.Factory;
  ReturnStatement: ReturnStatement.Factory;
  VariableDeclaration: VariableDeclaration.Factory;
  VariableDeclarationList: VariableDeclarationList.Factory;
  VariableStatement: VariableStatement.Factory;
  BinaryExpression: BinaryExpression.Factory;
  PropertyAccessExpression: PropertyAccessExpression.Factory;
  NoSubstitutionTemplateLiteral: NoSubstitutionTemplateLiteral.Factory;
  TemplateSpan: TemplateSpan.Factory;
  TemplateExpression: TemplateExpression.Factory;
  TemplateHead: TemplateHead.Factory;
  TemplateMiddle: TemplateMiddle.Factory;
  TemplateTail: TemplateTail.Factory;
  Identifier: Identifier.Factory;
  PropertyAssignment: PropertyAssignment.Factory;
  ObjectLiteralExpression: ObjectLiteralExpression.Factory;
  ElementAccessExpression: ElementAccessExpression.Factory;
  CallExpression: CallExpression.Factory;
  StringLiteral: StringLiteral.Factory;
  FunctionTypeNode: FunctionTypeNode.Factory;
  TypeLiteralNode: TypeLiteralNode.Factory;
}

export const create = (context: ts.TransformationContext): Type => {
  return {
    Block: Block.make(context),
    ClassDeclaration: ClassDeclaration.make(context),
    ParameterDeclaration: ParameterDeclaration.make(context),
    InterfaceDeclaration: InterfaceDeclaration.make(context),
    IndexedAccessTypeNode: IndexedAccessTypeNode.make(context),
    Namespace: Namespace.make(context),
    PropertySignature: PropertySignature.make(context),
    TypeAliasDeclaration: TypeAliasDeclaration.make(context),
    TypeNode: TypeNode.make(context),
    LiteralTypeNode: LiteralTypeNode.make(context),
    IndexSignatureDeclaration: IndexSignatureDeclaration.make(context),
    UnionTypeNode: UnionTypeNode.make(context),
    IntersectionTypeNode: IntersectionTypeNode.make(context),
    TypeReferenceNode: TypeReferenceNode.make(context),
    TypeParameterDeclaration: TypeParameterDeclaration.make(context),
    TypeOperatorNode: TypeOperatorNode.make(context),
    MethodDeclaration: MethodDeclaration.make(context),
    ConstructorDeclaration: ConstructorDeclaration.make(context),
    ReturnStatement: ReturnStatement.make(context),
    VariableDeclaration: VariableDeclaration.make(context),
    VariableDeclarationList: VariableDeclarationList.make(context),
    VariableStatement: VariableStatement.make(context),
    BinaryExpression: BinaryExpression.make(context),
    PropertyAccessExpression: PropertyAccessExpression.make(context),
    NoSubstitutionTemplateLiteral: NoSubstitutionTemplateLiteral.make(context),
    TemplateSpan: TemplateSpan.make(context),
    TemplateExpression: TemplateExpression.make(context),
    TemplateHead: TemplateHead.make(context),
    TemplateMiddle: TemplateMiddle.make(context),
    TemplateTail: TemplateTail.make(context),
    Identifier: Identifier.make(context),
    PropertyAssignment: PropertyAssignment.make(context),
    ObjectLiteralExpression: ObjectLiteralExpression.make(context),
    ElementAccessExpression: ElementAccessExpression.make(context),
    CallExpression: CallExpression.make(context),
    StringLiteral: StringLiteral.make(context),
    FunctionTypeNode: FunctionTypeNode.make(context),
    TypeLiteralNode: TypeLiteralNode.make(context),
  };
};
