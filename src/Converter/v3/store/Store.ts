import ts from "typescript";
import { State, createDefaultState, componentNames } from "./State";

export interface Type {
  getNamespace: (name: keyof State["components"]) => ts.ModuleDeclaration | undefined;
  addNamespace: (name: keyof State["components"], namespace: ts.ModuleDeclaration) => void;
  getStatement: (componentName: keyof State["components"], name: string) => ts.Statement | undefined;
  getRootStatements: () => ts.Statement[];
}

export const create = (): Type => {
  const state: State = createDefaultState();

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
    getStatement: (componentName: keyof State["components"], name: string): ts.Statement | undefined => {
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
    },
  };
};
