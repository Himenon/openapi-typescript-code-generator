import ts from "typescript";

export type InterfaceKey = string;
export type NamespaceKey = string;
export type Keys = InterfaceKey | NamespaceKey;

export interface NamespaceStatement {
  type: "namespace";
  value: ts.ModuleDeclaration;
  statements: { [key: string]: Statement };
}

export interface InterfaceStatement {
  type: "interface";
  value: ts.InterfaceDeclaration;
}

export type Statement = NamespaceStatement | InterfaceStatement;

export interface StatementMap {
  [key: string]: Statement | undefined;
};

export interface Components {
  schemas: StatementMap | undefined;
  headers: StatementMap | undefined;
  responses: StatementMap | undefined;
  parameters: StatementMap | undefined;
  requestBodies: StatementMap | undefined;
  securitySchemes: StatementMap | undefined;
  pathItems: StatementMap | undefined;
}

export type ComponentName = keyof Components;

type GenerateKey<T extends "namespace" | "interface"> = T extends "namespace" ? NamespaceKey : (T extends "interface" ? InterfaceKey : never);

export const generateKey = <T extends "namespace" | "interface">(type: T, key: string): GenerateKey<T>  => {
  return `${type}:${key}` as GenerateKey<T>;
}

export const componentNames: ComponentName[] = [
  "schemas",
  "headers",
  "responses",
  "parameters",
  "requestBodies",
  "securitySchemes",
  "pathItems",
];
