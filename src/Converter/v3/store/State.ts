import * as Def from "./Definition";

export interface Type {
  components: Def.StatementMap;
}

export const createDefaultState = (): Type => ({
  components: {},
});
