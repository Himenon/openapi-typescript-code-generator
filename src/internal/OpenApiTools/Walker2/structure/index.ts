import { Operator } from "@himenon/path-oriented-data-structure";

import * as OpenApiSchema from "./OpenApiSchema";
import * as DataStructure from "./DataStructure";
import * as Directory from "./Directory";

export { DataStructure, OpenApiSchema, Directory };

export interface AbstractDataStructureNodeProperty extends OpenApiSchema.Property {
  kind: OpenApiSchema.Kind;
}

export interface DirectoryTreeProperty extends Directory.Property {
  kind: Directory.Kind;
}

export type ComponentProperty = AbstractDataStructureNodeProperty | DirectoryTreeProperty;

export type Instance = OpenApiSchema.Item | Directory.Item;

export const createInstance = (componentProperty: ComponentProperty): Instance => {
  if (componentProperty.kind === "OpenApiSchema") {
    return new OpenApiSchema.Item(componentProperty);
  }
  if (componentProperty.kind === "directory") {
    return new Directory.Item(componentProperty);
  }

  throw new Error("not registers");
};

export const create = () => {
  const operator = new Operator(Directory.Kind);
  return {
    operator,
    getChildByPaths: DataStructure.createGetChildByPaths(operator),
  };
};

export type OperatorType = Operator<Directory.Kind>;

export type GetChildByPaths = DataStructure.GetChildByPaths;
