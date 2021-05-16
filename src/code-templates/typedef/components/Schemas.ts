import type ts from "typescript";

import { TsGenerator } from "../../../api";
import { AbstractStruct, OpenApi } from "../../../types";
import * as Schema from "./Schema";

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>;
}

export class Convert {
  public static generateNamespace(schemaLocations: AbstractStruct.SchemaLocation[]): ts.Statement {
    const statements: ts.Statement[] = schemaLocations.map(schemaLocation => {
      if (schemaLocation.kind === "common") {
        return Schema.Convert.generateStatement(schemaLocation.name, schemaLocation.schema);
      } else {
        return Schema.Convert.generateStatement("TODO", schemaLocation.schema);
      }
    });
    return TsGenerator.factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements: statements,
    });
  }
}
