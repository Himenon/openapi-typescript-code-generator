export type Kind =
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "undefined"
  | "null"
  | "never"
  | "any"
  | "void"
  | "union"
  | "intersection"
  | "array"
  | "object";

export interface BaseSchema {
  kind: Kind;
}

export interface StringSchema extends BaseSchema {
  kind: "string";
  enum?: string[];
}

export interface IntegerSchema extends BaseSchema {
  kind: "integer";
  enum?: number[];
}

export interface NumberSchema extends BaseSchema {
  kind: "number";
  enum?: number[];
}

export interface BooleanSchema extends BaseSchema {
  kind: "boolean";
}

export interface UndefinedSchema extends BaseSchema {
  kind: "undefined";
}

export interface NullSchema extends BaseSchema {
  kind: "null";
}

export interface NeverSchema extends BaseSchema {
  kind: "never";
}

export interface AnySchema extends BaseSchema {
  kind: "any";
}

export interface VoidSchema extends BaseSchema {
  kind: "void";
}

export interface UnionSchema extends BaseSchema {
  kind: "union";
  value: BaseSchema[];
}

export interface IntersectionSchema extends BaseSchema {
  kind: "intersection";
  value: BaseSchema[];
}

export interface ArrayParams {
  type: "array";
  value: BaseSchema;
}

export interface ObjectParams {
  type: "object";
  value: BaseSchema[];
}
