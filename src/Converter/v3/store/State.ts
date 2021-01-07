import ts from "typescript";

import { OpenApi } from "../types";
import * as Def from "./Definition";

export type A = ts.ModuleDeclaration;
export type B = ts.InterfaceDeclaration;
export type C = ts.TypeAliasDeclaration;

export interface OperationState {
  requestUri: string;
  httpMethod: string;
  parameterName?: string;
  requestBodyName?: string;
  parameters: OpenApi.Parameter[];
}

export interface Type {
  document: OpenApi.Document;
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

export const createDefaultOperationState = (httpMethod: string, requestUri: string, state: Partial<OperationState>): OperationState => {
  return {
    httpMethod: httpMethod,
    requestUri: requestUri,
    parameterName: state.parameterName,
    requestBodyName: state.parameterName,
    parameters: state.parameters || [],
  };
};

export const createDefaultState = (rootDocument: OpenApi.Document): Type => ({
  document: rootDocument,
  components: {},
  paths: {},
  additionalStatements: [],
  operations: {},
});
