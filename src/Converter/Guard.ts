import { OpenApi } from "../OpenApiParser";
import { ObjectSchema, PrimitiveSchema, ArraySchema, UnSupportSchema } from "./types";

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
