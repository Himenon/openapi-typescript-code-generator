import ts from "typescript";

import type { AbstractStruct, CodeGenerator } from "../../types";
import * as Components from "./components";
import { ConvertToolkit } from "./components/ConvertToolKit";

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
  const converter = {
    schemas: new Components.Schemas.Convert(ConvertToolkit),
  };

  return [converter.schemas.generateNamespace(schemaLocations)];
};
