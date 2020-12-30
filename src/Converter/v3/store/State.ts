import * as Def from "./Definition";

export interface Type {
  components: Def.Components;
}

export const createDefaultState = (): Type => ({
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
