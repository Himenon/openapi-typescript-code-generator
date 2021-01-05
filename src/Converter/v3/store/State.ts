import ts from "typescript";

import * as Def from "./Definition";

export type A = ts.ModuleDeclaration;
export type B = ts.InterfaceDeclaration;
export type C = ts.TypeAliasDeclaration;

export interface OperationState {
  parameterName?: string;
  requestBodyName?: string;
}

export interface Type {
  components: Def.StatementMap<A, B, C>;
  paths: {
    // "/a/b/c1": { ref: "components/pathItems/$hoge" }
    // "/a/b/c2": { ref: "components/pathItems/HogeCRUD" }
    [pathString: string]: {
      ref: string;
    };
  };
  additionalStatements: ts.Statement[];
  operations: {
    [operationId: string]: OperationState;
  };
}

export const createDefaultState = (): Type => ({
  components: {},
  paths: {},
  additionalStatements: [],
  operations: {},
});
