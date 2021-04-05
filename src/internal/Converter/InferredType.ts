import type { OpenApi } from "./types";

export const getInferredType = (schema: OpenApi.Schema): OpenApi.Schema | undefined => {
  if (schema.type || schema.oneOf || schema.allOf || schema.anyOf) {
    return schema;
  }
  // type: arrayを指定せずに、itemsのみを指定している場合に type array変換する
  if (schema.items) {
    return { ...schema, type: "array" };
  }
  // type: string/numberを指定せずに、enumのみを指定している場合に type array変換する
  if (schema.enum) {
    return { ...schema, type: "string" };
  }
  // type: objectを指定せずに、propertiesのみを指定している場合に type object変換する
  if (schema.properties) {
    return { ...schema, type: "object" };
  }
  // type: object, propertiesを指定せずに、requiredのみを指定している場合に type object変換する
  if (schema.required) {
    const properties = schema.required.reduce((s, name) => {
      return { ...s, [name]: { type: "any" } };
    }, {});
    return { ...schema, type: "object", properties };
  }
  return undefined;
};
