import type { OpenApi } from "../../../types";

/** OpenAPI 3.1 で追加された JSON Schema の型配列です。 */
export interface TypeArraySchema extends Omit<OpenApi.Schema, "type"> {
  type: OpenApi.JSONSchemaTypeName[];
}

export type UnSupportSchema = TypeArraySchema;

export interface OneOfSchema extends Omit<OpenApi.Schema, "oneOf"> {
  oneOf: OpenApi.JSONSchemaDefinition[];
}

export interface AllOfSchema extends Omit<OpenApi.Schema, "allOf"> {
  allOf: OpenApi.JSONSchemaDefinition[];
}

export interface AnyOfSchema extends Omit<OpenApi.Schema, "anyOf"> {
  anyOf: OpenApi.JSONSchemaDefinition[];
}

export interface ObjectSchema extends Omit<OpenApi.Schema, "type"> {
  type: "object";
}

export interface ObjectSchemaWithAdditionalProperties extends ObjectSchema {
  additionalProperties: OpenApi.JSONSchemaDefinition;
}

export interface ArraySchema extends Omit<OpenApi.Schema, "type"> {
  type: "array";
}

export interface PrimitiveSchema extends Omit<OpenApi.Schema, "type"> {
  type: "string" | "number" | "integer" | "boolean" | "null";
}

export interface AnySchema extends Omit<OpenApi.Schema, "type"> {
  type: "any";
}
