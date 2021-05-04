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
  | "typedef"
  | "alias";

export interface StringStruct {
  kind: "string";
  enum?: string[];
}

export interface IntegerStruct {
  kind: "integer";
  enum?: number[];
}

export interface NumberStruct {
  kind: "number";
  enum?: number[];
}

export interface BooleanStruct {
  kind: "boolean";
}

export interface UndefinedStruct {
  kind: "undefined";
}

export interface NullStruct {
  kind: "null";
}

export interface NeverStruct {
  kind: "never";
}

export interface AnyStruct {
  kind: "any";
}

export interface VoidStruct {
  kind: "void";
}

export interface UnionStruct {
  kind: "union";
  structs: Struct[];
}

export interface IntersectionStruct {
  kind: "intersection";
  structs: Struct[];
}

export interface IndexSignatureStruct {
  kind: "IndexSignature";
  name: string;
  struct: Struct;
}

export interface ReferenceStruct {
  kind: "reference";
  referencePath: string;
}

export interface ArrayStruct {
  kind: "array";
  struct: Struct;
}

/**
 * @example type Hoge = string;
 */
export interface TypeAliasStruct {
  kind: "typeAlias";
  name: string;
  comment?: string;
  struct: Struct;
}

export interface TypeLiteralStruct {
  kind: "typeLiteral";
  struct: Struct;
}

export interface PropertySignatureStruct {
  kind: "PropertySignature";
  name: string;
  optional: boolean;
  comment?: string;
  struct: Struct;
}

export interface InterfaceDeclarationStruct {
  kind: "interface";
  name: string;
  members: (IndexSignatureStruct | PropertySignatureStruct)[];
  comment?: string;
}

/**
 * namespace or interface
 */
export interface TypeDefinitionStruct {
  kind: "typedef";
  name: string;
  struct: Struct;
}

export interface ObjectStruct {
  kind: "object";
  properties: (PropertySignatureStruct | IndexSignatureStruct)[];
}

export type Struct =
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
  | InterfaceDeclarationStruct
  | TypeAliasStruct
  | TypeDefinitionStruct
  | TypeLiteralStruct;