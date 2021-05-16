import ts from "typescript";

import { TsGenerator } from "../../api";
import type { AbstractStruct, CodeGenerator } from "../../types";
import { JsonSchemaToTypeDefinition } from "../../utils";
import * as Components from "./components";

export interface Option {}

export const generator: CodeGenerator.AdvancedGenerateFunction<Option> = (payload, option?: Option): CodeGenerator.IntermediateCode[] => {
  const { accessor, entryPoint } = payload;
  const schemaPaths = accessor.operator.getNodePaths("OpenApiSchema");

  // TODO 短くする
  const schemaLocations: AbstractStruct.SchemaLocation[] = [];
  schemaPaths.map(currentPoint => {
    const item = accessor.getChildByPaths(currentPoint, "OpenApiSchema");
    if (!item) {
      return;
    }
    if (item.value.kind === "common") {
      schemaLocations.push(item.value);
    }
  });

  return [Components.Schemas.Convert.generateNamespace(schemaLocations)];
};
