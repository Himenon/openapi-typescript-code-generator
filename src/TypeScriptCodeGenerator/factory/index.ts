import * as ts from "typescript";
import * as Interface from "./Interface";
import * as Namespace from "./Namespace";
import * as Property from "./Property";
import * as TypeAliasDeclaration from "./TypeAliasDeclaration";
import * as TypeNode from "./TypeNode";
import * as LiteralTypeNode from "./LiteralTypeNode";
import * as IndexSignature from "./IndexSignature";

export { Interface, Namespace, Property, TypeAliasDeclaration, TypeNode, LiteralTypeNode };

export interface Type {
  Interface: Interface.Factory;
  Namespace: Namespace.Factory;
  Property: Property.Factory;
  TypeAliasDeclaration: TypeAliasDeclaration.Factory;
  TypeNode: TypeNode.Factory;
  LiteralTypeNode: LiteralTypeNode.Factory;
  IndexSignature: IndexSignature.Factory;
}

export const create = (context: ts.TransformationContext): Type => {
  return {
    Interface: Interface.create(context),
    Namespace: Namespace.create(context),
    Property: Property.create(context),
    TypeAliasDeclaration: TypeAliasDeclaration.create(context),
    TypeNode: TypeNode.create(context),
    LiteralTypeNode: LiteralTypeNode.create(context),
    IndexSignature: IndexSignature.create(context),
  };
};
