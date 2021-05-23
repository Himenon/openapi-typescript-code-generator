import type * as OpenApi from "./OpenApi";

export interface LocalReferenceSchemaLocation {
  kind: "local-reference";
  schema: OpenApi.Reference;
  currentPoint: string;
}

export interface RemoteReferenceSchema {
  kind: "remote-reference";
  schema: OpenApi.Reference;
  currentPoint: string;
}
/**
 * 
 * Schemas:
 *   Hoge:             // name
 *     type: object    // schema
 *     properties:
 *       key1:
 *         type: string
 */
export interface NamedSchemaLocation {
  kind: "common";
  name: string;
  schema: OpenApi.Schema | OpenApi.JSONSchema | boolean;
}

export type SchemaLocation = NamedSchemaLocation | LocalReferenceSchemaLocation | RemoteReferenceSchema;
