import * as Path from "path";

import { Tree } from "@himenon/path-oriented-data-structure";
import Dot from "dot-prop";
import ts from "typescript";

import { Factory } from "../../../CodeGenerator";
import { UnSupportError } from "../../../Exception";
import { OpenApi } from "../types";
import * as Def from "./Definition";
import * as Operation from "./Operation";
import * as State from "./State";
import * as Structure from "./structure";

export interface Type {
  addComponent: (componentName: Def.ComponentName, statement: Structure.ComponentParams) => void;
  /**
   * @params path: "components/headers/hoge"
   */
  addStatement: (path: string, statement: Structure.ComponentParams) => void;
  getStatement: <T extends Structure.DataStructure.Kind>(path: string, kind: T) => Structure.DataStructure.GetChild<T> | undefined;
  /**
   * @params path: "components/headers/hoge"
   */
  hasStatement: (path: string, types: Structure.DataStructure.Kind[]) => boolean;
  addAdditionalStatement: (statements: ts.Statement[]) => void;
  getRootStatements: () => ts.Statement[];
  updateOperationState: (httpMethod: string, requestUri: string, operationId: string, state: Partial<State.OperationState>) => void;
  getNoReferenceOperationState: () => Operation.State;
  getPathItem: (localPath: string) => OpenApi.PathItem;
  isAfterDefined: (referencePath: string) => boolean;
  getParameter: (localPath: string) => OpenApi.Parameter;
}

export const create = (factory: Factory.Type, rootDocument: OpenApi.Document): Type => {
  const state: State.Type = State.createDefaultState(rootDocument);
  const { operator, getChildByPaths } = Structure.create();
  const isAfterDefined = (referencePath: string) => {
    return !!Dot.get(state.document, referencePath.replace(/\//g, "."));
  };

  const convertNamespace = (tree: Tree<Structure.NamespaceTree.Kind> | Structure.NamespaceTree.Item): ts.Statement => {
    const statements: ts.Statement[] = [];
    Object.values(tree.getChildren()).map(child => {
      if (child instanceof Tree || child instanceof Structure.NamespaceTree.Item) {
        statements.push(convertNamespace(child));
      } else if (child instanceof Structure.InterfaceNode.Item) {
        statements.push(child.value);
      } else if (child instanceof Structure.TypeAliasNode.Item) {
        statements.push(child.value);
      }
    });
    if (tree instanceof Structure.NamespaceTree.Item) {
      return factory.Namespace.create({
        export: true,
        name: tree.params.name,
        statements,
        comment: tree.params.comment,
        deprecated: tree.params.deprecated,
      });
    }
    return factory.Namespace.create({
      export: true,
      name: tree.name,
      statements,
    });
  };

  const getRootStatements = (): ts.Statement[] => {
    // fs.writeFileSync("debug/tree.json", JSON.stringify(operator.getHierarchy(), null, 2), { encoding: "utf-8" });
    const statements = Def.componentNames.reduce<ts.Statement[]>((statements, componentName) => {
      const treeOfNamespace = getChildByPaths(componentName, "namespace");
      if (treeOfNamespace) {
        return statements.concat(convertNamespace(treeOfNamespace));
      }
      return statements;
    }, []);
    return statements.concat(state.additionalStatements);
  };

  return {
    hasStatement: (path: string, types: Structure.DataStructure.Kind[]): boolean => {
      const alreadyRegistered = types.some(type => !!operator.getChildByPaths(path, type));
      return alreadyRegistered;
    },
    addStatement: (path: string, statement: Structure.ComponentParams): void => {
      if (!path.startsWith("components")) {
        throw new UnSupportError(`componentsから始まっていません。path=${path}`);
      }
      const targetPath = Path.posix.relative("components", path);
      operator.set(targetPath, Structure.createInstance(statement));
    },
    getStatement: <T extends Structure.DataStructure.Kind>(path: string, kind: T): Structure.DataStructure.GetChild<T> | undefined => {
      const targetPath = Path.posix.relative("components", path);
      return getChildByPaths(targetPath, kind);
    },
    getRootStatements,
    addComponent: (componentName: Def.ComponentName, statement: Structure.ComponentParams): void => {
      operator.set(`${componentName}`, Structure.createInstance(statement));
    },
    getNoReferenceOperationState: () => Operation.create(state.document),
    updateOperationState: (httpMethod: string, requestUri: string, operationId: string, newOperationState: Partial<State.OperationState>) => {
      let operationState = state.operations[operationId];
      if (operationState) {
        operationState = { ...operationState, ...newOperationState };
      } else {
        operationState = State.createDefaultOperationState(httpMethod, requestUri, newOperationState);
      }
      state.operations[operationId] = operationState;
    },
    addAdditionalStatement: (statements: ts.Statement[]) => {
      state.additionalStatements = state.additionalStatements.concat(statements);
    },
    getPathItem: (localPath: string): OpenApi.PathItem => {
      if (!localPath.startsWith("components/pathItem")) {
        throw new Error("Only use start with 'component/pathItems': " + localPath);
      }
      const result = Dot.get<OpenApi.PathItem>(state.document, localPath.replace(/\//g, "."));
      if (!result) {
        throw new Error(`Not found ${localPath}`);
      }
      return result;
    },
    getParameter: (localPath: string): OpenApi.Parameter => {
      if (!localPath.startsWith("components/parameters")) {
        throw new Error("Only use start with 'component/parameters': " + localPath);
      }
      const result = Dot.get<OpenApi.Parameter>(state.document, localPath.replace(/\//g, "."));
      if (!result) {
        throw new Error(`Not found ${localPath}`);
      }
      return result;
    },
    isAfterDefined,
  };
};
