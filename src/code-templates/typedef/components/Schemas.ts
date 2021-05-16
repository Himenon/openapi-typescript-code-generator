import type ts from "typescript";

import { TsGenerator } from "../../../api";
import { AbstractStruct, OpenApi } from "../../../types";
import * as Schema from "./Schema";
import type { InitializeParams } from "./types";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  private readonly schema = new Schema.Convert(this.params);
  constructor(private readonly params: InitializeParams) {}
  public generateNamespace(schemaLocations: AbstractStruct.SchemaLocation[]): ts.Statement {
    const statements: ts.Statement[] = schemaLocations.map(schemaLocation => {
      if (schemaLocation.kind === "common") {
        return this.schema.generateStatement(schemaLocation.name, schemaLocation.schema);
      } else {
        return this.schema.generateStatement("TODO", schemaLocation.schema);
      }
    });
    return TsGenerator.factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements: statements,
    });
  }
}
