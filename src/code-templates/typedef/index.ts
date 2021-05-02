import type { CodeGenerator } from "../../types";

export const generator: CodeGenerator.AdvancedGenerateFunction = (accessor): CodeGenerator.IntermediateCode[] => {
  return accessor.operator.getNodePaths("typedef");
};
