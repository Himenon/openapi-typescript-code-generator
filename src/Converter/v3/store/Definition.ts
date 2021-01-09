export type InterfaceKey = string;
export type NamespaceKey = string;
export type Keys = InterfaceKey | NamespaceKey;

export interface NamespaceStatement<T, U, V> {
  type: "namespace";
  name: string;
  value: T;
  statements: StatementMap<T, U, V>;
}

export interface TypeAliasStatement<T> {
  type: "typeAlias";
  name: string;
  value: T;
}

export interface InterfaceStatement<T> {
  type: "interface";
  name: string;
  value: T;
}

export type Statement<T, U, V> = NamespaceStatement<T, U, V> | InterfaceStatement<U> | TypeAliasStatement<V>;

export interface StatementMap<T, U, V> {
  [key: string]: Statement<T, U, V> | undefined;
}

export type ComponentName = "schemas" | "headers" | "responses" | "parameters" | "requestBodies" | "securitySchemes" | "pathItems";

export type GenerateKey<A, B, C, T extends Statement<A, B, C>["type"]> = T extends "namespace"
  ? NamespaceKey
  : T extends "interface"
  ? InterfaceKey
  : never;
export type GetStatement<A, B, C, T extends Statement<A, B, C>["type"]> = T extends "namespace"
  ? NamespaceStatement<A, B, C>
  : T extends "interface"
  ? InterfaceStatement<B>
  : T extends "typeAlias"
  ? TypeAliasStatement<C>
  : never;

export const generateKey = <A, B, C, T extends Statement<A, B, C>["type"]>(type: T, key: string): GenerateKey<A, B, C, T> => {
  return `${type}:${key}` as GenerateKey<A, B, C, T>;
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
