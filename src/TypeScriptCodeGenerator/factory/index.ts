import ts from "typescript";

import * as Block from "./Block";
import * as ClassDeclaration from "./ClassDeclaration";
import * as ConstructorDeclaration from "./ConstructorDeclaration";
import * as IndexedAccessTypeNode from "./IndexedAccessTypeNode";
import * as IndexSignatureDeclaration from "./IndexSignatureDeclaration";
import * as InterfaceDeclaration from "./InterfaceDeclaration";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as MethodDeclaration from "./MethodDeclaration";
import * as Namespace from "./Namespace";
import * as ParameterDeclaration from "./ParameterDeclaration";
import * as PropertySignature from "./PropertySignature";
import * as ReturnStatement from "./ReturnStatement";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as TypeNode from "./TypeNode";
import * as TypeOperatorNode from "./TypeOperatorNode";
import * as TypeParameterDeclaration from "./TypeParameterDeclaration";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as UnionTypeNode from "./UnionTypeNode";

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
  };
};
