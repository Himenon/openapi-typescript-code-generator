import * as ts from "typescript";
import * as Interface from "./Interface";
import * as Namespace from "./Namespace";
import * as Property from "./Property";
import * as TypeNode from "./TypeNode";

export { Interface, Namespace, Property, TypeNode };

export interface Type {
  Interface: Interface.Factory;
  Namespace: Namespace.Factory;
  Property: Property.Factory;
  TypeNode: TypeNode.Factory;
}

export const create = (context: ts.TransformationContext): Type => {
  return {
    Interface: Interface.create(context),
    Namespace: Namespace.create(context),
    Property: Property.create(context),
    TypeNode: TypeNode.create(context),
  };
};
