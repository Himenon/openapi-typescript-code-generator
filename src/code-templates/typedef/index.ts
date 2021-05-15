import type ts from "typescript";

import { TsGenerator } from "../../api";
import type { AbstractStruct, CodeGenerator } from "../../types";
import { convert } from "./StructToTypeNode";

const factory = TsGenerator.Factory.create();

const generateTypeAlias = (struct: AbstractStruct.TypeAliasStruct): ts.Statement => {
  const { struct: childStruct } = struct;
  return factory.TypeAliasDeclaration.create({
    export: true,
    name: struct.name,
    type: convert(childStruct),
  });
};

const generateInterface = (struct: AbstractStruct.InterfaceDeclarationStruct): ts.Statement => {
  return factory.InterfaceDeclaration.create({
    export: true,
    name: struct.name,
    members: [],
    comment: "",
  });
};

const createCode = (struct: AbstractStruct.SchemaLocation): CodeGenerator.IntermediateCode => {
  switch (struct.kind) {
    case "interface":
      return generateInterface(struct);
    case "typeAlias":
      return generateTypeAlias(struct);
    default: {
      return `let a = ` + JSON.stringify(struct, null, 4) + "\n";
    }
  }
};

export const generator: CodeGenerator.AdvancedGenerateFunction = (accessor): CodeGenerator.IntermediateCode[] => {
  const paths = accessor.operator.getNodePaths("abstract-data");
  const code = paths.reduce<CodeGenerator.IntermediateCode[]>((codes, p, idx) => {
    const item = accessor.getChildByPaths(p, "abstract-data");
    if (item) {
      codes.push(createCode(item.value));
    }
    return codes;
  }, []);
  return code;
};
