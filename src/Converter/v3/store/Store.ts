import * as fs from "fs";
import { relative } from "path";

import yaml from "js-yaml";
import ts from "typescript";

import { UnSupportError } from "../../../Exception";
import { Factory } from "../../../TypeScriptCodeGenerator";
import { OpenApi } from "../types";
import * as Def from "./Definition";
import * as Masking from "./masking";
import * as Operation from "./Operation";
import * as PropAccess from "./PropAccess";
import * as State from "./State";

export type A = State.A;
export type B = State.B;
export type C = State.C;

export interface Type {
  addComponent: (componentName: Def.ComponentName, statement: Def.Statement<A, B, C>) => void;
  /**
   * @params path: "components/headers/hoge"
   */
  addStatement: (path: string, statement: Def.Statement<A, B, C>) => void;
  getStatement: (path: string, types: Def.Statement<A, B, C>["type"]) => Def.Statement<A, B, C> | undefined;
  /**
   * @params path: "components/headers/hoge"
   */
  hasStatement: (path: string, types: Def.Statement<A, B, C>["type"][]) => boolean;
  addAdditionalStatement: (statements: ts.Statement[]) => void;
  getRootStatements: () => ts.Statement[];
  updateOperationState: (httpMethod: string, requestUri: string, operationId: string, state: Partial<State.OperationState>) => void;
  getOperationState: (operationId: string) => State.OperationState;
  dump: (filename: string) => void;
  dumpOperationState: (filename: string) => void;
  getNoReferenceOperationState: () => Operation.State;
}

export const create = (factory: Factory.Type, rootDocument: OpenApi.Document): Type => {
  const state: State.Type = State.createDefaultState(rootDocument);

  const createNamespace = (name: string): Def.NamespaceStatement<A, B, C> => {
    const value = factory.Namespace.create({
      export: true,
      name,
      statements: [],
    });
    return {
      type: "namespace",
      value,
      statements: {},
    };
  };

  const addComponent = (componentName: Def.ComponentName, statement: Def.Statement<A, B, C>): void => {
    const key = Def.generateKey("namespace", componentName);
    state.components[key] = statement;
  };

  const getStatement = (path: string, type: Def.Statement<A, B, C>["type"]) => {
    const targetPath = relative("components", path);
    const result = PropAccess.get(state.components, type, targetPath);
    const flag = `${!!result}`.padEnd(5, " ");
    return result;
  };

  const hasStatement = (path: string, types: Def.Statement<A, B, C>["type"][]): boolean => {
    const targetPath = relative("components", path);
    return types.some(type => !!PropAccess.get(state.components, type, targetPath));
  };

  const addStatement = (path: string, statement: Def.Statement<A, B, C>): void => {
    if (!path.startsWith("components")) {
      throw new UnSupportError(`componentsから始まっていません。path=${path}`);
    }
    const targetPath = relative("components", path);
    state.components = PropAccess.set(state.components, targetPath, statement, createNamespace);
  };

  const interfaceToStatement = (node: Def.InterfaceStatement<B>): ts.Statement => {
    return node.value;
  };

  const typeAliasToStatement = (node: Def.TypeAliasStatement<C>): ts.Statement => {
    return node.value;
  };

  const namespaceToTsStatement = (node: Def.NamespaceStatement<A, B, C>): ts.Statement => {
    const statements = Object.values(node.statements).reduce<ts.Statement[]>((previous, childStatement) => {
      if (!childStatement) {
        return previous;
      }
      if (childStatement.type === "namespace") {
        return previous.concat(namespaceToTsStatement(childStatement));
      }
      if (childStatement.type === "typeAlias") {
        return previous.concat(typeAliasToStatement(childStatement));
      }
      return previous.concat(interfaceToStatement(childStatement));
    }, []);
    return factory.Namespace.addStatements({
      node: node.value,
      statements,
    });
  };

  const dump = (filename: string) => {
    fs.writeFileSync(filename, yaml.dump(Masking.maskValue(state)), { encoding: "utf-8" });
  };

  const dumpOperationState = (filename: string) => {
    fs.writeFileSync(filename, JSON.stringify(state.operations, null, 2), { encoding: "utf-8" });
  };

  const addAdditionalStatement = (statements: ts.Statement[]) => {
    state.additionalStatements = state.additionalStatements.concat(statements);
  };

  const getRootStatements = (): ts.Statement[] => {
    const statements = Def.componentNames.reduce<ts.Statement[]>((statements, componentName) => {
      const component = state.components[Def.generateKey("namespace", componentName)];
      if (!component) {
        return statements;
      }
      if (component.type === "interface") {
        return statements.concat(interfaceToStatement(component));
      }
      if (component.type === "namespace") {
        return statements.concat(namespaceToTsStatement(component));
      }
      if (component.type === "typeAlias") {
        return statements.concat(typeAliasToStatement(component));
      }
      return statements;
    }, []);
    fs.writeFileSync("debug/sample.yml", yaml.dump(Masking.maskValue(state)), { encoding: "utf-8" });
    return statements.concat(state.additionalStatements);
  };

  const updateOperationState = (
    httpMethod: string,
    requestUri: string,
    operationId: string,
    newOperationState: Partial<State.OperationState>,
  ) => {
    let operationState = state.operations[operationId];
    if (operationState) {
      const parameters = operationState.parameters.concat(newOperationState.parameters || []);
      operationState = { ...operationState, ...newOperationState, parameters };
    } else {
      operationState = State.createDefaultOperationState(httpMethod, requestUri, newOperationState);
    }
    state.operations[operationId] = operationState;
  };

  const getOperationState = (operationId: string): State.OperationState => {
    const operationState = state.operations[operationId];
    if (operationState) {
      return operationState;
    }
    dumpOperationState("debug/error-getOperationState.json");
    throw new Error(`Not found ${operationId}`);
  };

  const getNoReferenceOperationState = (): Operation.State => {
    return Operation.create(state.document);
  };

  return {
    hasStatement,
    addStatement,
    getStatement,
    getRootStatements,
    addComponent,
    dump,
    getNoReferenceOperationState,
    updateOperationState,
    getOperationState,
    addAdditionalStatement,
    dumpOperationState,
  };
};
