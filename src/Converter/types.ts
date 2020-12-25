import { OpenApi } from "../OpenApiParser";

export interface UnSupportSchema extends Omit<OpenApi.Schema, "type"> {
  type: OpenApi.JSONSchemaTypeName[];
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
