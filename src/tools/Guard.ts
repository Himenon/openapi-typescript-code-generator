import type { AbstractStruct } from "../types";

export const isStringStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.StringStruct => {
  return struct.kind === "string";
};

export const isIntegerStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.IntegerStruct => {
  return struct.kind === "integer";
};

export const isNumberStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.NumberStruct => {
  return struct.kind === "number";
};

export const isBooleanStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.BooleanStruct => {
  return struct.kind === "boolean";
};

export const isUndefinedStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.UndefinedStruct => {
  return struct.kind === "undefined";
};

export const isNullStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.NullStruct => {
  return struct.kind === "null";
};

export const isNeverStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.NeverStruct => {
  return struct.kind === "never";
};

export const isAnyStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.AnyStruct => {
  return struct.kind === "any";
};

export const isVoidStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.VoidStruct => {
  return struct.kind === "any";
};

export const isUnionStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.UnionStruct => {
  return struct.kind === "union";
};

export const isIntersectionStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.IntersectionStruct => {
  return struct.kind === "intersection";
};

export const isReferenceStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.ReferenceStruct => {
  return struct.kind === "reference";
};

export const isArrayStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.ArrayStruct => {
  return struct.kind === "array";
};

export const isObjectStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.ObjectStruct => {
  return struct.kind === "object";
};

export const isInterfaceDeclarationStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.InterfaceDeclarationStruct => {
  return struct.kind === "interface";
};

export const isTypeAliasStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.TypeAliasStruct => {
  return struct.kind === "typeAlias";
};

export const isTypeDefinitionStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.TypeDefinitionStruct => {
  return struct.kind === "typedef";
};

export const isTypeLiteralStruct = (struct: AbstractStruct.Struct): struct is AbstractStruct.TypeLiteralStruct => {
  return struct.kind === "typeLiteral";
};
