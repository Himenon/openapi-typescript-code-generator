import ts from "typescript";

import { OpenApi } from "../types";

export interface OperationState {
  requestUri: string;
  httpMethod: string;
  parameterName?: string;
  requestBodyName?: string;
}

export interface Type {
  document: OpenApi.Document;
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
  };
};

export const createDefaultState = (rootDocument: OpenApi.Document): Type => ({
  document: rootDocument,
  paths: {},
  additionalStatements: [],
  operations: {},
});
