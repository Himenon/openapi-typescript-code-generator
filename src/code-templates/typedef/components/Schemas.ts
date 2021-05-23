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
  public generateNamespace(schemaLocations: { [currentPoint: string]: AbstractStruct.SchemaLocation }): ts.Statement {
    const statements: ts.Statement[] = Object.entries(schemaLocations).map(([currentPoint, schemaLocation]) => {
      if (schemaLocation.kind === "common") {
        return this.schema.generateStatement(schemaLocation.name, schemaLocation.schema);
      } else {
        // if (schemaLocation.referenceType === "remote") {
          const ref = schemaLocation.schema.$ref;
          const resolvedSchema = this.params.resolver.getSchema(currentPoint, ref);
          return this.schema.generateStatement("TODO", resolvedSchema);
        // } else {

        // }

      }
    });
    return TsGenerator.factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements: statements,
    });
  }
}
