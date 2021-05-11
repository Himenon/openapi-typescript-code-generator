import type { OpenApi } from "../../../types";
import type { AbstractStruct } from "../../../types";
import * as Reference from "../components2/Reference";
import { ConverterContext } from "./context";

export interface Option {
  parent?: any;
}

export interface ResolveReferencePath {
  name: string;
  maybeResolvedName: string;
  unresolvedPaths: string[];
}

export type Convert = (
  payload: Payload,
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition,
  option?: Option,
) => AbstractStruct.Struct;

export interface Context {
  setReferenceHandler: (currentPoint: string, reference: Reference.Type<OpenApi.Schema | OpenApi.JSONSchemaDefinition>) => void;
  resolveReferencePath: (currentPoint: string, referencePath: string) => ResolveReferencePath;
}

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  context: Context;
  converterContext: ConverterContext;
}
