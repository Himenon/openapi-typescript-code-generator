import type * as Walker from "../Walker2";

export interface InitializeParams {
  readonly entryPoint: string;
  readonly store: Walker.Store;
}
