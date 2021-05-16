import ts from "typescript";

import { TsGenerator } from "../../../api";
import { OpenApi } from "../../../types";
import { JsonSchemaToTypeDefinition } from "../../../utils";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  public static generateStatement(name: string, schema: OpenApi.Schema | OpenApi.Reference | boolean): ts.Statement {
    return TsGenerator.factory.TypeAliasDeclaration.create({
      export: true,
      name: name,
      type: JsonSchemaToTypeDefinition.convert({
        schema,
      }),
    });
  }
}
