import type { CodeGenerator, ParsedSchema } from "../../types";

export interface Option {}

export const generator: CodeGenerator.AdvancedGenerateFunction<Option> = (
  accessor: ParsedSchema.Accessor,
  option?: Option,
): CodeGenerator.IntermediateCode[] => {
  const paths = accessor.operator.getNodePaths("OpenApiSchema");
  return paths;
};
