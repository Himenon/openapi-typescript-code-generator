import ts from "typescript";
import * as Def from "./Definition";
import * as State from "./State";
import { relative } from "path";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as PropAccess from "./PropAccess";

export interface Type {
  addComponent: (componentName: Def.ComponentName, statement: Def.Statement) => void;
  /**
   * @params path: "components/headers/hoge"
   */
  addStatement: (path: string, statement: Def.Statement) => void;
  /**
   * @params path: "components/headers/hoge"
   */
  hasStatement: (path: string, type: Def.Statement["type"]) => boolean;
  getRootStatements: () => ts.Statement[];
}

export const create = (factory: Factory.Type): Type => {
  const state: State.Type = State.createDefaultState();

  const createNamespace = (name: string): Def.NamespaceStatement => {
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

  const addComponent = (componentName: Def.ComponentName, statement: Def.Statement): void => {
    const key = Def.generateKey("namespace", componentName);
    console.log(`Namespaceに${key} が追加されました`);
    state.components[key] = statement;
  };

  const hasStatement = (path: string, type: Def.Statement["type"]): boolean => {
    const targetPath = relative("components", path);
    return !!PropAccess.get(state.components, type, targetPath);
  };

  const addStatement = (path: string, statement: Def.Statement): void => {
    const targetPath = relative("components", path);
    console.log(`${path} に ${statement.type} が追加されました`);
    state.components = PropAccess.set(state.components, targetPath, statement, createNamespace);
  };

  const interfaceToStatement = (node: Def.InterfaceStatement): ts.Statement => {
    return node.value;
  };

  const namespaceToTsStatement = (node: Def.NamespaceStatement): ts.Statement => {
    const statements = Object.values(node.statements).reduce<ts.Statement[]>((previous, childStatement) => {
      if (!childStatement) {
        return previous;
      }
      if (childStatement.type === "namespace") {
        return previous.concat(namespaceToTsStatement(childStatement));
      }
      return previous.concat(interfaceToStatement(childStatement));
    }, []);
    return factory.Namespace.addStatements({
      node: node.value,
      statements,
    });
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
      return statements;
    }, []);
    return statements;
  };

  return {
    hasStatement,
    addStatement,
    getRootStatements,
    addComponent,
  };
};
