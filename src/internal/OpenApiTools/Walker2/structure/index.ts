import { Operator } from "@himenon/path-oriented-data-structure";

import * as AbstractDataStructure from "./AbstractDataStructure";
import * as DataStructure from "./DataStructure";
import * as Directory from "./Directory";

export { DataStructure, AbstractDataStructure, Directory };

export interface AbstractDataStructureNodeProperty extends AbstractDataStructure.Property {
  kind: AbstractDataStructure.Kind;
}

export interface DirectoryTreeProperty extends Directory.Property {
  kind: Directory.Kind;
}

export type ComponentProperty = AbstractDataStructureNodeProperty | DirectoryTreeProperty;

export type Instance = AbstractDataStructure.Item | Directory.Item;

export const createInstance = (componentProperty: ComponentProperty): Instance => {
  if (componentProperty.kind === "abstract-data") {
    return new AbstractDataStructure.Item(componentProperty);
  }
  if (componentProperty.kind === "directory") {
    return new Directory.Item(componentProperty);
  }

  throw new Error("not registers");
};

export const create = () => {
  const operator = new Operator<Directory.Kind>("directory");
  return {
    operator,
    getChildByPaths: DataStructure.createGetChildByPaths(operator),
  };
};

export type OperatorType = Operator<Directory.Kind>;

export type GetChildByPaths = DataStructure.GetChildByPaths;
