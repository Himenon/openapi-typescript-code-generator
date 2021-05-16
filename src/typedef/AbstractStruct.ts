import type * as OpenApi from "./OpenApi";

export interface ReferenceSchemaLocation {
  kind: "reference";
  referenceType: "local" | "remote";
  resolvedPath: string;
  schema: OpenApi.Schema | OpenApi.JSONSchema | OpenApi.Reference;
}

export interface CommonSchemaLocation {
  kind: "common";
  schema: OpenApi.Schema | OpenApi.JSONSchema | boolean;
}

export type SchemaLocation = CommonSchemaLocation | ReferenceSchemaLocation;
