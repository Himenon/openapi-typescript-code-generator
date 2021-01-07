import * as Reference from "../components/Reference";
import * as Guard from "../Guard";
import { OpenApi } from "../types";

export { OpenApi };

export type ObjectLike = { [key: string]: any };

const isObject = (value: any): value is ObjectLike => {
  return !!value && value !== null && !Array.isArray(value) && typeof value === "object";
};

const resolveObjectReference = (entryPoint: string, currentPoint: string, obj: ObjectLike): ObjectLike => {
  Object.entries(obj).forEach(([key, value]) => {
    if (Guard.isReference(value)) {
      const { referencePoint, data } = Reference.resolveRemoteReference(entryPoint, currentPoint, value);
      if (isObject(data)) {
        obj[key] = resolveObjectReference(entryPoint, referencePoint, data);
      } else {
        obj[key] = data;
      }
    } else {
      if (isObject(value)) {
        obj[key] = resolveObjectReference(entryPoint, currentPoint, value);
      }
    }
  });
  return obj;
};

export const resolve = (entryPoint: string, currentPoint: string, rootSchema: OpenApi.Document): OpenApi.Document => {
  const obj = resolveObjectReference(entryPoint, currentPoint, rootSchema);
  return obj as OpenApi.Document;
};
