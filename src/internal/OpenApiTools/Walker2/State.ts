import ts from "typescript";

import type { OpenApi } from "../../../types";

export type {
  OperatorType,
  GetChildByPaths,
  Instance,
  ComponentProperty,
  DirectoryTreeProperty,
  AbstractDataStructureNodeProperty,
} from "./structure";

export interface OperationState {
  requestUri: string;
  httpMethod: string;
  parameterName?: string;
  requestBodyName?: string;
}

export interface Type {
  document: OpenApi.Document;
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
  additionalStatements: [],
  operations: {},
});
