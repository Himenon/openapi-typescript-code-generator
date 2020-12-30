import ts from "typescript";
import * as Def from "./Definition";
import * as State from "./State";
import { Factory } from "../../../TypeScriptCodeGenerator";
import * as dot from "dot-prop";

export interface Type {
  addStatement: (path: string, statement: Def.NamespaceStatement | Def.InterfaceStatement) => void;
  hasStatement: (path: string, name: string) => boolean;
  getRootStatements: () => ts.Statement[];
}

export const create = (factory: Factory.Type): Type => {
  const state: State.Type = State.createDefaultState();
  const hasStatement = (path: string, name: string): boolean => {
    dot.get(state)
  };

  const addStatement = (path: string, statement: Def.NamespaceStatement | Def.InterfaceStatement): void => {
    return;
  };

  const getRootStatements = (): ts.Statement[] => {
    return [];
  };

  return {
    hasStatement,
    addStatement,
    getRootStatements,
  };
};
