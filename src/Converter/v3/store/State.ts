import ts from "typescript";

import { OpenApi } from "../types";
import * as Def from "./Definition";

export type A = ts.ModuleDeclaration;
export type B = ts.InterfaceDeclaration;
export type C = ts.TypeAliasDeclaration;

export interface OperationState {
  requestUri: string;
  parameterName?: string;
  requestBodyName?: string;
  parameters: OpenApi.Parameter[];
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

export const createDefaultOperationState = (requestUri: string, state: Partial<OperationState>): OperationState => {
  return {
    requestUri: requestUri,
    parameterName: state.parameterName,
    requestBodyName: state.parameterName,
    parameters: state.parameters || [],
  };
};

export const createDefaultState = (): Type => ({
  components: {},
  paths: {},
  additionalStatements: [],
  operations: {},
});
