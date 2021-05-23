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
    const statements: ts.Statement[] = Object.values(schemaLocations).map((schemaLocation) => {
      if (schemaLocation.kind === "common") {
        return this.schema.generateStatement(schemaLocation.name, schemaLocation.schema);
      } else {
        const ref = schemaLocation.schema.$ref;
        const resolvedSchema = this.params.resolver.getSchema(schemaLocation.currentPoint, ref);
        if (!resolvedSchema) {
          throw new Error(resolvedSchema);
        }
        return this.schema.generateStatement("名前を決める関数を入れる", resolvedSchema);
      }
    });
    return TsGenerator.factory.Namespace.create({
      export: true,
      name: "Schemas",
      statements: statements,
    });
  }
}
