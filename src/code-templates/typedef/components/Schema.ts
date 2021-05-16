import ts from "typescript";

import { TsGenerator } from "../../../api";
import { OpenApi } from "../../../types";
import type { ConvertToolkit } from "./ConvertToolKit";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  constructor(private readonly toolkit: ConvertToolkit) {}
  public generateStatement(name: string, schema: OpenApi.Schema | OpenApi.Reference | boolean): ts.Statement {
    return TsGenerator.factory.TypeAliasDeclaration.create({
      export: true,
      name: name,
      type: this.toolkit.getTypeNode(schema),
    });
  }
}
