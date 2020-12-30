export type InterfaceKey = string;
export type NamespaceKey = string;
export type Keys = InterfaceKey | NamespaceKey;

export interface NamespaceStatement<T, U> {
  type: "namespace";
  value: T;
  statements: StatementMap<T, U>;
}

export interface InterfaceStatement<T> {
  type: "interface";
  value: T;
}

export type Statement<T, U> = NamespaceStatement<T, U> | InterfaceStatement<U>;

export interface StatementMap<T, U> {
  [key: string]: Statement<T, U> | undefined;
}

export type ComponentName = "schemas" | "headers" | "responses" | "parameters" | "requestBodies" | "securitySchemes" | "pathItems";

export type GenerateKey<A, B, T extends Statement<A, B>["type"]> = T extends "namespace"
  ? NamespaceKey
  : T extends "interface"
  ? InterfaceKey
  : never;
export type GetStatement<A, B, T extends Statement<A, B>["type"]> = T extends "namespace"
  ? NamespaceStatement<A, B>
  : T extends "interface"
  ? InterfaceStatement<B>
  : never;

export const generateKey = <A, B, T extends Statement<A, B>["type"]>(type: T, key: string): GenerateKey<A, B, T> => {
  return `${type}:${key}` as GenerateKey<A, B, T>;
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
