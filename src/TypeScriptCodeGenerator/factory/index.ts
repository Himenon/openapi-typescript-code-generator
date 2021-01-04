import ts from "typescript";

import * as IndexSignatureDeclaration from "./IndexSignatureDeclaration";
import * as InterfaceDeclaration from "./InterfaceDeclaration";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as Namespace from "./Namespace";
import * as PropertySignature from "./PropertySignature";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as TypeNode from "./TypeNode";
import * as TypeParameterDeclaration from "./TypeParameterDeclaration";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as UnionTypeNode from "./UnionTypeNode";

export interface Type {
  InterfaceDeclaration: InterfaceDeclaration.Factory;
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
}

export const create = (context: ts.TransformationContext): Type => {
  return {
    InterfaceDeclaration: InterfaceDeclaration.make(context),
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
  };
};
