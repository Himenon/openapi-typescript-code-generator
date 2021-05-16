import type { ParsedSchema } from "../../../types";
import type { ConvertToolkit } from "./ConvertToolKit";

export interface InitializeParams {
  readonly entryPoint: string;
  readonly accessor: ParsedSchema.Accessor;
  readonly toolkit: ConvertToolkit;
}
