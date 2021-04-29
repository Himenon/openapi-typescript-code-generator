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
  | "object"
  | "interface"
  | "alias";

export interface BaseStruct {
  kind: Kind;
}

export interface StringStruct extends BaseStruct {
  kind: "string";
  enum?: string[];
}

export interface IntegerStruct extends BaseStruct {
  kind: "integer";
  enum?: number[];
}

export interface NumberStruct extends BaseStruct {
  kind: "number";
  enum?: number[];
}

export interface BooleanStruct extends BaseStruct {
  kind: "boolean";
}

export interface UndefinedStruct extends BaseStruct {
  kind: "undefined";
}

export interface NullStruct extends BaseStruct {
  kind: "null";
}

export interface NeverStruct extends BaseStruct {
  kind: "never";
}

export interface AnyStruct extends BaseStruct {
  kind: "any";
}

export interface VoidStruct extends BaseStruct {
  kind: "void";
}

export interface UnionStruct extends BaseStruct {
  kind: "union";
  schemaTypes: BaseStruct[];
}

export interface IntersectionStruct extends BaseStruct {
  kind: "intersection";
  schemaTypes: BaseStruct[];
}

export interface IndexSignatureStruct extends BaseStruct {
  kind: "IndexSignature";
  name: string;
  schemaType: BaseStruct;
}

export interface ReferenceStruct extends BaseStruct {
  kind: "reference";
  name: string;
}

export interface ArrayStruct extends BaseStruct {
  kind: "array";
  schemaType: BaseStruct;
}

export interface AliasStruct extends BaseStruct {
  kind: "alias";
  name: string;
  comment?: string;
  schema: Type;
}

export interface PropertySignatureStruct extends BaseStruct {
  kind: "PropertySignature";
  name: string;
  optional: boolean;
  comment?: string;
  schemaType: Type;
}

export interface InterfaceDeclarationStruct extends BaseStruct {
  kind: "interface";
  name: string;
  members: (IndexSignatureStruct | PropertySignatureStruct)[];
  comment?: string;
}

export interface ObjectStruct extends BaseStruct {
  kind: "object";
  properties: (PropertySignatureStruct | IndexSignatureStruct)[];
}

export type Type =
  | StringStruct
  | IntegerStruct
  | NumberStruct
  | BooleanStruct
  | UndefinedStruct
  | NullStruct
  | NeverStruct
  | AnyStruct
  | VoidStruct
  | UnionStruct
  | IntersectionStruct
  | ReferenceStruct
  | ArrayStruct
  | ObjectStruct
  | InterfaceDeclarationStruct;
