import type { CodeGenerator } from "../../types";
import { EOL } from "os";

export const generator: CodeGenerator.AdvancedGenerateFunction = (accessor): CodeGenerator.IntermediateCode[] => {
  const paths = accessor.operator.getNodePaths("abstract-data");

  const code = paths.reduce<CodeGenerator.IntermediateCode[]>((codes, p, idx) => {
    const absData = accessor.getChildByPaths(p, "abstract-data");
    if (absData) {
      const tmp = `let a${idx} = ` + JSON.stringify(absData.value, null, 4) + "\n";
      codes.push(tmp);
    }
    return codes;
  }, []);
  return code
};
