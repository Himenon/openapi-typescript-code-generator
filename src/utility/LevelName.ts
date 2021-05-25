import { posix as path } from "path";

type Component =
  | "schemas"
  | "responses"
  | "parameters"
  | "examples"
  | "requestBodies"
  | "headers"
  | "securitySchemes"
  | "links"
  | "callbacks"
  | "pathItems";

const componentMap: Record<string, Component> = {
  "components/schemas": "schemas",
  "components/responses": "responses",
  "components/parameters": "parameters",
  "components/examples": "examples",
  "components/requestBodies": "requestBodies",
  "components/headers": "headers",
  "components/securitySchemes": "securitySchemes",
  "components/links": "links",
  "components/callbacks": "callbacks",
  "components/pathItems": "pathItems",
};

const detectBaseComponent = (p: string): Component | undefined => {
  const key = path.normalize(p).split("/").slice(0, 2).join("/");
  return componentMap[key];
};

const generateAbsoluteName = (point: string): string => {
  const pointArray = point.split("/");
  const newPointArray = pointArray.slice(1).map((text, idx) => {
    if (idx === 0) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return text;
  });
  return newPointArray.join(".");
}

const generateRelativeName = (point: string): string => {
  return point.split("/").join(".");
}

export const makeAliasName = (entryPoint: string, currentPoint: string, referencePoint: string): string => {
  const relativeCurrentPoint = path.relative(path.dirname(entryPoint), currentPoint);
  const isSameBaseComponent = detectBaseComponent(relativeCurrentPoint) === detectBaseComponent(referencePoint);
  if (isSameBaseComponent) {
    const relativePoint = path.relative(path.dirname(relativeCurrentPoint), referencePoint);
    return generateRelativeName(relativePoint);
  }
 
  return generateAbsoluteName(referencePoint);
};
