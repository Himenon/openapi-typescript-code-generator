import DotProp from "dot-prop";

import { DevelopmentError } from "../../../Exception";
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
  return isObject(obj) && typeof obj.$ref === "string" && !obj.$ref.startsWith("#") && !obj.$ref.startsWith("http");
};

const isLocalReference = (obj: any): boolean => {
  return !isRemoteReference(obj);
};

const resolveRemoteReference = (entryPoint: string, currentPoint: string, obj: any, parentKey?: string): any => {
  // console.log(parentKey);
  if (Guard.isReference(obj)) {
    if (isLocalReference(obj)) {
      return obj;
    }
    if (isRemoteReference(obj)) {
      const { referencePoint, data } = Reference.resolveRemoteReference(entryPoint, currentPoint, obj);
      if (isArray(data)) {
        return data.map((item, idx) => resolveRemoteReference(entryPoint, referencePoint, item, [parentKey, idx].join(".")));
      }
      if (isObject(data)) {
        Object.entries(data).forEach(([key, value]) => {
          data[key] = resolveRemoteReference(entryPoint, referencePoint, value, [parentKey, key].join("."));
        });
        return data;
      }
    }
    return obj;
  }
  // ----- objがreferenceではない場合 ------
  if (isArray(obj)) {
    return obj.map((item, idx) => resolveRemoteReference(entryPoint, currentPoint, item, [parentKey, idx].join(".")));
  }
  if (isObject(obj)) {
    Object.entries(obj).forEach(([key, value]) => {
      obj[key] = resolveRemoteReference(entryPoint, currentPoint, value, [parentKey, key].join("."));
    });
  }
  return obj;
};

const resolveLocalReference = (entryPoint: string, currentPoint: string, obj: any, rootSchema: any, parentKey?: string): any => {
  // console.log(parentKey);
  if (Guard.isReference(obj)) {
    if (isRemoteReference(obj)) {
      throw new DevelopmentError("まずはremote referenceを解決してください\n" + JSON.stringify(obj, null, 2));
    }
    if (isLocalReference(obj)) {
      const ref = Reference.generateLocalReference(obj);
      if (!ref) {
        throw new DevelopmentError(`なにかが間違っている\n${JSON.stringify(ref, null, 2)}`);
      }
      return DotProp.get(rootSchema, ref.path.replace(/\//g, "."));
    }
    return obj;
  }
  // ----- objがreferenceではない場合 ------
  if (isArray(obj)) {
    return obj.map((item, idx) => resolveLocalReference(entryPoint, currentPoint, item, rootSchema, [parentKey, idx].join(".")));
  }
  if (isObject(obj)) {
    Object.entries(obj).forEach(([key, value]) => {
      obj[key] = resolveLocalReference(entryPoint, currentPoint, value, rootSchema, [parentKey, key].join("."));
    });
  }
  return obj;
};

export const resolve = (entryPoint: string, currentPoint: string, rootSchema: OpenApi.Document): OpenApi.Document => {
  const obj1 = resolveRemoteReference(entryPoint, currentPoint, rootSchema, "remote");
  const obj2 = resolveLocalReference(entryPoint, currentPoint, obj1, obj1, "local");
  return obj2 as OpenApi.Document;
};
