import ts from "typescript";

import { TsGenerator } from "../api";
import type { OpenApi } from "../types";

const factory = TsGenerator.Factory.create();

export interface Payload {
  entryPoint: string;
  currentPoint: string;
  schema: OpenApi.Schema | OpenApi.Reference | OpenApi.JSONSchemaDefinition;
}

export const convert = (payload: Payload): ts.TypeNode => {
  const schema = payload.schema;
  if (typeof schema === "boolean") {
    // https://swagger.io/docs/specification/data-models/dictionaries/#free-form
    return factory.TypeNode.create({
      type: "object",
      value: [],
    });
  }

  return factory.TypeNode.create({
    type: "any",
  })
};
