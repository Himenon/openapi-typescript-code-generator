import ts from "typescript";
import * as Def from "./Definition";

export type A = ts.ModuleDeclaration;
export type B = ts.InterfaceDeclaration;

export interface Type {
  components: Def.StatementMap<A, B>;
}

export const createDefaultState = (): Type => ({
  components: {},
});
