import { JSONSchema7 } from "json-schema";

export type JSONSchema = JSONSchema7;

export type MapLike<K extends string, T> = {
  [key in K]: T;
};
