import { OpenApi } from "../OpenApiParser";
import { ObjectSchema, ObjectSchemaWithAdditionalProperties, PrimitiveSchema, ArraySchema, UnSupportSchema } from "./types";

export const isReference = (data: any): data is OpenApi.Reference => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return typeof data.$ref === "string";
};

export const isUnSupportSchema = (schema: OpenApi.Schema): schema is UnSupportSchema => {
  return Array.isArray(schema.type);
};

export const isObjectSchema = (schema: OpenApi.Schema): schema is ObjectSchema => {
  return schema.type === "object";
};

export const isArraySchema = (schema: OpenApi.Schema): schema is ArraySchema => {
  return schema.type === "array";
};

export const isPrimitiveSchema = (schema: OpenApi.Schema): schema is PrimitiveSchema => {
  if (schema.type === "object") {
    return false;
  }
  if (schema.type === "array") {
    return false;
  }
  return true;
};

export const isNumberArray = (list: any[]): list is number[] => {
  return !list.some(item => typeof item !== "number");
};

export const isStringArray = (list: any[]): list is string[] => {
  return !list.some(item => typeof item !== "string");
};

export const isObjectSchemaWithAdditionalProperties = (schema: ObjectSchema): schema is ObjectSchemaWithAdditionalProperties => {
  return !!schema.additionalProperties;
};
