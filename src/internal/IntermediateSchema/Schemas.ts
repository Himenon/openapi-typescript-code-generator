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
  | "reference"
  | "array"
  | "PropertySignature"
  | "IndexSignature"
  | "object";

export interface BaseSchemaTypes {
  kind: Kind;
}

export interface StringSchema extends BaseSchemaTypes {
  kind: "string";
  enum?: string[];
}

export interface IntegerSchema extends BaseSchemaTypes {
  kind: "integer";
  enum?: number[];
}

export interface NumberSchema extends BaseSchemaTypes {
  kind: "number";
  enum?: number[];
}

export interface BooleanSchema extends BaseSchemaTypes {
  kind: "boolean";
}

export interface UndefinedSchema extends BaseSchemaTypes {
  kind: "undefined";
}

export interface NullSchema extends BaseSchemaTypes {
  kind: "null";
}

export interface NeverSchema extends BaseSchemaTypes {
  kind: "never";
}

export interface AnySchema extends BaseSchemaTypes {
  kind: "any";
}

export interface VoidSchema extends BaseSchemaTypes {
  kind: "void";
}

export interface UnionSchema extends BaseSchemaTypes {
  kind: "union";
  schemaTypes: BaseSchemaTypes[];
}

export interface IntersectionSchema extends BaseSchemaTypes {
  kind: "intersection";
  schemaTypes: BaseSchemaTypes[];
}

export interface IndexSignatureSchema extends BaseSchemaTypes {
  kind: "IndexSignature";
  name: string;
  schemaType: BaseSchemaTypes;
}

export interface ReferenceSchema extends BaseSchemaTypes {
  kind: "reference";
  name: string;
}

export interface ArrayParams extends BaseSchemaTypes {
  kind: "array";
  schemaType: BaseSchemaTypes;
}

export interface PropertySignatureParams extends BaseSchemaTypes {
  kind: "PropertySignature";
  name: string;
  optional: boolean;
  comment?: string;
  schemaType: BaseSchemaTypes;
}

export interface ObjectParams extends BaseSchemaTypes {
  kind: "object";
  properties: (PropertySignatureParams | IndexSignatureSchema)[];
}

export type SchemaType =
  | StringSchema
  | IntegerSchema
  | NumberSchema
  | BooleanSchema
  | UndefinedSchema
  | NullSchema
  | NeverSchema
  | AnySchema
  | VoidSchema
  | UnionSchema
  | IntersectionSchema
  | ReferenceSchema
  | ArrayParams
  | ObjectParams;
