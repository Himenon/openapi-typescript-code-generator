import ts from "typescript";

import { OpenApi } from "../../../types";
import type { InitializeParams } from "./types";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  constructor(private readonly params: InitializeParams) {}
  public generateTypeNode(schema: OpenApi.Reference): ts.TypeNode {
    return this.params.toolkit.generateTypeNode(schema);
  }
}
