import type { OpenApi } from "../../types";

export const getInferredType = (schema: OpenApi.Schema): OpenApi.Schema | undefined => {
  if (schema.type || schema.oneOf || schema.allOf || schema.anyOf) {
    return schema;
  }
  // OpenAPI 3.1 で JSON Schema の const キーワードが利用可能になりました。
  if (Object.hasOwn(schema, "const")) {
    const value = schema.const;
    const type = value === null ? "null" : typeof value;
    if (type === "string" || type === "number" || type === "boolean" || type === "null") {
      return { ...schema, type } as OpenApi.Schema;
    }
  }
  // type: arrayを指定せずに、itemsのみを指定している場合に type array変換する
  if (schema.items) {
    return { ...schema, type: "array" };
  }
  // type: string/numberを指定せずに、enumのみを指定している場合に type array変換する
  if (schema.enum) {
    const enumTypes = [
      ...new Set(
        schema.enum
          .map(value => {
            if (value === null) return "null";
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return typeof value;
            return undefined;
          })
          .filter((type): type is "string" | "number" | "boolean" | "null" => !!type),
      ),
    ];
    // OpenAPI 3.1 では enum の値から複数の JSON Schema 型を推論できます。
    if (enumTypes.length > 1) {
      return { ...schema, type: enumTypes };
    }
    return { ...schema, type: enumTypes[0] || "string" };
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
