import ts from "typescript";

import { TsGenerator } from "../../../api";
import { OpenApi } from "../../../types";
import type { InitializeParams } from "./types";

export class Convert {
  constructor(private readonly params: InitializeParams) {}
  public generateStatement(name: string, schema: OpenApi.Schema | OpenApi.Reference | boolean): ts.Statement {
    return TsGenerator.factory.TypeAliasDeclaration.create({
      export: true,
      name: name,
      type: this.params.toolkit.generateTypeNode(schema),
    });
  }
}
