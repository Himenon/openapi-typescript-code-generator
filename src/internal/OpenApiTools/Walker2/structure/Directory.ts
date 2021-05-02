import { Tree as BaseTree } from "@himenon/path-oriented-data-structure";

export type Kind = "directory";
export const Kind: Kind = "directory";

export interface Property {
  name: string;
  comment?: string;
  deprecated?: boolean;
}

export class Item extends BaseTree<Kind> {
  constructor(public property: Property) {
    super("directory", property.name);
  }
}
