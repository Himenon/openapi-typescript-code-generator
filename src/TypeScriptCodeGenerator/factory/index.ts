import ts from "typescript";

import * as IndexSignature from "./IndexSignature";
import * as Interface from "./Interface";
import * as IntersectionTypeNode from "./IntersectionTypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as Namespace from "./Namespace";
import * as Property from "./Property";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as TypeNode from "./TypeNode";
import * as TypeReferenceNode from "./TypeReferenceNode";
import * as UnionTypeNode from "./UnionTypeNode";

export { Interface, Namespace, Property, TypeAliasDeclaration, TypeNode, LiteralTypeNode };

export interface Type {
  Interface: Interface.Factory;
  Namespace: Namespace.Factory;
  Property: Property.Factory;
  TypeAliasDeclaration: TypeAliasDeclaration.Factory;
  TypeNode: TypeNode.Factory;
  LiteralTypeNode: LiteralTypeNode.Factory;
  IndexSignature: IndexSignature.Factory;
  UnionTypeNode: UnionTypeNode.Factory;
  IntersectionTypeNode: IntersectionTypeNode.Factory;
  TypeReferenceNode: TypeReferenceNode.Factory;
}

export const create = (context: ts.TransformationContext): Type => {
  return {
    Interface: Interface.create(context),
    Namespace: Namespace.make(context),
    Property: Property.create(context),
    TypeAliasDeclaration: TypeAliasDeclaration.make(context),
    TypeNode: TypeNode.create(context),
    LiteralTypeNode: LiteralTypeNode.create(context),
    IndexSignature: IndexSignature.create(context),
    UnionTypeNode: UnionTypeNode.create(context),
    IntersectionTypeNode: IntersectionTypeNode.create(context),
    TypeReferenceNode: TypeReferenceNode.make(context),
  };
};
