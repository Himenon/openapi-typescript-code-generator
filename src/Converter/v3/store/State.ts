import ts from "typescript";
import * as Def from "./Definition";

export type A = ts.ModuleDeclaration;
export type B = ts.InterfaceDeclaration;
export type C = ts.TypeAliasDeclaration;

export interface Type {
  components: Def.StatementMap<A, B, C>;
}

export const createDefaultState = (): Type => ({
  components: {},
});
