import * as Reference from "../components/Reference";
import * as Guard from "../Guard";
import { OpenApi } from "../types";

export { OpenApi };

export type ObjectLike = { [key: string]: any };

const isObject = (value: any): value is ObjectLike => {
  return !!value && value !== null && !Array.isArray(value) && typeof value === "object";
};

const isArray = (value: any): value is any[] => {
  return !!value && Array.isArray(value);
};

const isRemoteReference = (obj: any): boolean => {
  return isObject(obj) && typeof obj.$ref === "string" && (!obj.$ref.startsWith("#") || !obj.$ref.startsWith("http"));
};

const isLocalReference = (obj: any): boolean => {
  return !isRemoteReference(obj);
};

const resolveObjectReference = (entryPoint: string, currentPoint: string, obj: any, parentKey?: string): any => {
  console.log(parentKey);
  if (Guard.isReference(obj)) {
    if (isLocalReference(obj)) {
      return obj;
    }
    if (isRemoteReference(obj)) {
      const { referencePoint, data } = Reference.resolveRemoteReference(entryPoint, currentPoint, obj);
      if (isArray(data)) {
        return data.map((item, idx) => resolveObjectReference(entryPoint, referencePoint, item, [parentKey, idx].join(".")));
      }
      if (isObject(data)) {
        Object.entries(data).forEach(([key, value]) => {
          data[key] = resolveObjectReference(entryPoint, referencePoint, value, [parentKey, key].join("."));
        });
        return data;
      }
    }
    return obj;
  }
  // ----- objがreferenceではない場合 ------
  if (isArray(obj)) {
    return obj.map((item, idx) => resolveObjectReference(entryPoint, currentPoint, item, [parentKey, idx].join(".")));
  }
  if (isObject(obj)) {
    Object.entries(obj).forEach(([key, value]) => {
      obj[key] = resolveObjectReference(entryPoint, currentPoint, value, [parentKey, key].join("."));
    });
  }
  return obj;
};

export const resolve = (entryPoint: string, currentPoint: string, rootSchema: OpenApi.Document): OpenApi.Document => {
  const obj = resolveObjectReference(entryPoint, currentPoint, rootSchema, "root");
  return obj as OpenApi.Document;
};
