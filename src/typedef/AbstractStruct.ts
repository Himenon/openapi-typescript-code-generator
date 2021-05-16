import type * as OpenApi from "./OpenApi";

export interface ReferenceSchemaLocation {
  kind: "reference";
  referenceType: "local" | "remote";
  resolvedPath: string;
  schema: OpenApi.Schema | OpenApi.JSONSchema | OpenApi.Reference;
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

export type SchemaLocation = NamedSchemaLocation | ReferenceSchemaLocation;
