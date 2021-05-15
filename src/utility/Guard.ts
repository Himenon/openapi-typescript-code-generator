import type { AbstractStruct } from "../types";

export const isStringStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.StringStruct => {
  return struct.kind === "string";
};

export const isIntegerStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.IntegerStruct => {
  return struct.kind === "integer";
};

export const isNumberStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.NumberStruct => {
  return struct.kind === "number";
};

export const isBooleanStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.BooleanStruct => {
  return struct.kind === "boolean";
};

export const isUndefinedStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.UndefinedStruct => {
  return struct.kind === "undefined";
};

export const isNullStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.NullStruct => {
  return struct.kind === "null";
};

export const isNeverStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.NeverStruct => {
  return struct.kind === "never";
};

export const isAnyStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.AnyStruct => {
  return struct.kind === "any";
};

export const isVoidStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.VoidStruct => {
  return struct.kind === "any";
};

export const isUnionStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.UnionStruct => {
  return struct.kind === "union";
};

export const isIntersectionStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.IntersectionStruct => {
  return struct.kind === "intersection";
};

export const isReferenceStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.ReferenceStruct => {
  return struct.kind === "reference";
};

export const isArrayStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.ArrayStruct => {
  return struct.kind === "array";
};

export const isObjectStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.ObjectStruct => {
  return struct.kind === "object";
};

export const isInterfaceDeclarationStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.InterfaceDeclarationStruct => {
  return struct.kind === "interface";
};

export const isTypeAliasStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.TypeAliasStruct => {
  return struct.kind === "typeAlias";
};

export const isTypeDefinitionStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.TypeDefinitionStruct => {
  return struct.kind === "typedef";
};

export const isTypeLiteralStruct = (struct: AbstractStruct.SchemaLocation): struct is AbstractStruct.TypeLiteralStruct => {
  return struct.kind === "typeLiteral";
};
