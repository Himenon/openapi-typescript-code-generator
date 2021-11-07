import type { OpenApi } from "../../../types";

export interface UnSupportSchema extends Omit<OpenApi.Schema, "type"> {
  type: OpenApi.JSONSchemaTypeName[];
}

export interface OneOfSchema extends Omit<OpenApi.Schema, "oneOf"> {
  oneOf: OpenApi.JSONSchema[];
}

export interface AllOfSchema extends Omit<OpenApi.Schema, "allOf"> {
  allOf: OpenApi.JSONSchema[];
}

export interface AnyOfSchema extends Omit<OpenApi.Schema, "anyOf"> {
  anyOf: OpenApi.JSONSchema[];
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
