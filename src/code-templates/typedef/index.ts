import type { AbstractStruct, CodeGenerator } from "../../types";
import * as Components from "./components";
import { ConvertToolkit } from "./components/ConvertToolKit";
import type { InitializeParams } from "./components/types";

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
  const initializeParams: InitializeParams = {
    accessor: payload.accessor,
    entryPoint: payload.entryPoint,
    toolkit: ConvertToolkit,
  };
  const converter = {
    schemas: new Components.Schemas.Convert(initializeParams),
  };

  return [converter.schemas.generateNamespace(schemaLocations)];
};
