import ts from "typescript";
export interface Components {
  schemas: ts.ModuleDeclaration | undefined;
  headers: ts.ModuleDeclaration | undefined;
  responses: ts.ModuleDeclaration | undefined;
  parameters: ts.ModuleDeclaration | undefined;
  requestBodies: ts.ModuleDeclaration | undefined;
  securitySchemes: ts.ModuleDeclaration | undefined;
  pathItems: ts.ModuleDeclaration | undefined;
}

export interface State {
  components: Components;
}

export const componentNames: Array<keyof State["components"]> = [
  "schemas",
  "headers",
  "responses",
  "parameters",
  "requestBodies",
  "securitySchemes",
  "pathItems",
];

export const createDefaultState = (): State => ({
  components: {
    schemas: undefined,
    headers: undefined,
    responses: undefined,
    parameters: undefined,
    requestBodies: undefined,
    securitySchemes: undefined,
    pathItems: undefined,
  },
});
