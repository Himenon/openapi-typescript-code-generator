import ts from "typescript";

export type InterfaceKey = string;
export type NamespaceKey = string;
export type Keys = InterfaceKey | NamespaceKey;

export interface NamespaceStatement {
  type: "namespace";
  value: ts.ModuleDeclaration;
  statements: StatementMap;
}

export interface InterfaceStatement {
  type: "interface";
  value: ts.InterfaceDeclaration;
}

export type Statement = NamespaceStatement | InterfaceStatement;

export interface StatementMap {
  [key: string]: Statement | undefined;
}

export type ComponentName = "schemas" | "headers" | "responses" | "parameters" | "requestBodies" | "securitySchemes" | "pathItems";

export type GenerateKey<T extends Statement["type"]> = T extends "namespace" ? NamespaceKey : T extends "interface" ? InterfaceKey : never;
export type GetStatement<T extends Statement["type"]> = T extends "namespace"
  ? NamespaceStatement
  : T extends "interface"
  ? InterfaceStatement
  : never;

export const generateKey = <T extends Statement["type"]>(type: T, key: string): GenerateKey<T> => {
  return `${type}:${key}` as GenerateKey<T>;
};

export const componentNames: ComponentName[] = [
  "schemas",
  "headers",
  "responses",
  "parameters",
  "requestBodies",
  "securitySchemes",
  "pathItems",
];
