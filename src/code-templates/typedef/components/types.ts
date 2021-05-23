import type { ParsedSchema } from "../../../types";
import type { ConvertToolkit } from "./ConvertToolKit";
import type { Resolver } from "../../../reference-resolver";

export interface InitializeParams {
  readonly entryPoint: string;
  readonly accessor: ParsedSchema.Accessor;
  readonly toolkit: ConvertToolkit;
  readonly resolver: Resolver;
}
