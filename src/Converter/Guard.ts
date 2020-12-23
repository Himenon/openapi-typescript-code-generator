import { OpenApi } from "../OpenApiParser";

export const isReference = (data: any): data is OpenApi.Reference => {
  if (typeof data !== "object" || data === null) {
    return false;
  }
  return typeof data.$ref === "string";
};

// export const isParameters = (data: any): data is OpenApi.Parameter => {
//   if (isReference(data)) {
//     return false;
//   }
// }
