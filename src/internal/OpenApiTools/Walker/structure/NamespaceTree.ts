import { Tree as BaseTree } from "@himenon/path-oriented-data-structure";

export type Kind = "namespace";

export interface Params {
  name: string;
  comment?: string;
  deprecated?: boolean;
}

export class Item extends BaseTree<Kind> {
  constructor(public params: Params) {
    super("namespace", params.name);
  }
}
