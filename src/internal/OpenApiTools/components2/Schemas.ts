import type { OpenApi } from "../../../types";
import { ReferencePath } from "../../../utils";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as Name from "../Name";
import * as Reference from "./Reference";
import type { InitializeParams } from "./types";

export class Locator {
  private basePath = "components/schemas";
  public reference: Reference.Locator = new Reference.Locator(this.params);
  constructor(private readonly params: InitializeParams) {
    this.params.store.createDirectory("schemas", {
      kind: "directory",
      name: Name.Components.Schemas,
    });
  }

  public determine(currentPoint: string, schemas: Record<string, OpenApi.Schema | OpenApi.Reference>) {
    Object.entries(schemas).forEach(([name, schema]) => {
      if (Guard.isReference(schema)) {
        this.determineByReference(currentPoint, name, schema);
      } else {
        this.determineByCommon(currentPoint, name, schema);
      }
    });
  }

  private determineByCommon(currentPoint: string, name: string, inputSchema: OpenApi.Schema) {
    const schema = InferredType.getInferredType(inputSchema);
    if (schema) {
      const path = `${this.basePath}/${name}`;
      this.params.store.determineSchemaLocation(path, {
        kind: "common",
        name: name,
        schema: schema,
      });
    }
  }

  private determineByReference(currentPoint: string, name: string, schema: OpenApi.Reference) {
    const reference = this.reference.search(currentPoint, schema);
    if (reference.type === "local") {
      this.params.store.determineSchemaLocation(`${this.basePath}/${name}`, {
        kind: "local-reference",
        schema: schema,
      });
      return;
    } else if (reference.type === "remote") {
      if (this.params.store.isPossession(`${this.basePath}/${name}`)) {
        return;
      }
      this.params.store.determineSchemaLocation(reference.path, {
        kind: "remote-reference",
        schema: schema,
      });
      return;
    }
  }
}
