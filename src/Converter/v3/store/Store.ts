import ts from "typescript";
import { State, createDefaultState, componentNames } from "./State";
import { Factory } from "../../../TypeScriptCodeGenerator";

export interface Type {
  getNamespace: (name: keyof State["components"]) => ts.ModuleDeclaration | undefined;
  addNamespace: (name: keyof State["components"], namespace: ts.ModuleDeclaration) => void;
  addStatements: (componentName: keyof State["components"], name: string, statements: ts.Statement[]) => void;
  getStatement: (componentName: keyof State["components"], name: string) => ts.Statement | undefined;
  hasStatement: (componentName: keyof State["components"], name: string) => boolean;
  getRootStatements: () => ts.Statement[];
}

export const create = (factory: Factory.Type): Type => {
  const state: State = createDefaultState();
  const getStatement = (componentName: keyof State["components"], name: string): ts.Statement | undefined => {
    const namespace = state.components[componentName];
    if (!namespace || !namespace.body) {
      return;
    }
    let result: ts.Statement | undefined;
    namespace.body.forEachChild(node => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === name) {
        result = node;
      }
    });
    return result;
  };
  const hasStatement = (componentName: keyof State["components"], name: string): boolean => !!getStatement(componentName, name);
  return {
    getNamespace: (componentName: keyof State["components"]): ts.ModuleDeclaration | undefined => {
      return state.components[componentName];
    },
    addNamespace: (componentName: keyof State["components"], namespace: ts.ModuleDeclaration) => {
      state.components[componentName] = namespace;
    },
    getRootStatements: () => {
      return componentNames.reduce<ts.Statement[]>((previous, componentName) => {
        const component = state.components[componentName];
        if (component) {
          previous.push(component);
        }
        return previous;
      }, []);
    },
    getStatement,
    hasStatement,
    addStatements: (componentName: keyof State["components"], name: string, statements: ts.Statement[]): void => {
      if (hasStatement(componentName, name)) {
        return;
      }
      const namespace = state.components[componentName];
      if (!namespace) {
        return;
      }
      state.components[componentName] = factory.Namespace.addStatements({
        node: namespace,
        statements,
      });
    },
  };
};
