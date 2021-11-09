import ts from "typescript";

import * as Utils from "../../utils";
import type { Factory } from "../TsGenerator";

export interface FormatConversion {
  /**
   * Search parameters for the Schema to be converted
   */
  selector: {
    /**
     * DataType format
     *
     * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#data-types
     */
    format: string;
  };
  /**
   * Output format
   */
  output: {
    /**
     * The type after conversion. The input string will be output as a typedef.
     */
    type: string[];
    /**
     * How to handle typedefs when there is more than one.
     *
     * Default oneOf
     */
    multiType?: "allOf" | "oneOf";
  };
}

/**
 * ユーザーが利用できる各種変換オプション
 */
export interface Options {
  formatConversions?: FormatConversion[];
}

export interface Types {
  /**
   * operationIdに対するescape
   */
  escapeOperationIdText: (operationId: string) => string;
  /**
   * interface/namespace/typeAliasのnameをescapeする
   * import/exportなどの予約語も裁く
   */
  escapeDeclarationText: (text: string) => string;
  /**
   * Schemas.A.B.Cに対するEscape
   */
  escapeReferenceDeclarationText: (text: string) => string;
  /**
   * 非破壊: PropertySignatureのname用のescape
   */
  escapePropertySignatureName: (text: string) => string;
  /**
   * 破壊: TypeReferenceのname用のescape
   */
  escapeTypeReferenceNodeName: (text: string) => string;
  generateResponseName: (operationId: string, statusCode: string) => string;
  generateArgumentParamsTypeDeclaration: (operationId: string) => string;
  generateRequestContentTypeName: (operationId: string) => string;
  generateResponseContentTypeName: (operationId: string) => string;
  generateParameterName: (operationId: string) => string;
  generateRequestBodyName: (operationId: string) => string;
  generateFunctionName: (operationId: string) => string;
  convertFormatTypeNode: (schema: { format?: string }) => undefined | ts.TypeNode;
}

const createFormatSchemaToTypeNode = (factory: Factory.Type, target: FormatConversion): ts.TypeNode => {
  const typeNodes = target.output.type.map(value => {
    return factory.TypeReferenceNode.create({
      name: value,
    });
  });
  if (target.output.multiType === "allOf") {
    return factory.IntersectionTypeNode.create({
      typeNodes: typeNodes,
    });
  }
  return factory.UnionTypeNode.create({
    typeNodes: typeNodes,
  });
};

/**
 * ユーザーが利用できる各種変換オプション
 */
export const create = (factory: Factory.Type, options?: Options): Types => {
  const convertReservedWord = (word: string): string => {
    if (["import", "export"].includes(word)) {
      return word + "_";
    }
    return word;
  };
  const convertString = (text: string): string => {
    if (Utils.isAvailableVariableName(text)) {
      return text;
    }
    return text.replace(/-/g, "$").replace(/\//g, "$");
  };
  return {
    escapeOperationIdText: (operationId: string): string => {
      return convertString(operationId);
    },
    escapeDeclarationText: (text: string) => {
      // console.log(`escapeDeclarationText: ${text}` + `-> ${convertReservedWord(convertString(text).replace(/\./g, "$"))}`.padStart(100, " "));
      return convertReservedWord(convertString(text).replace(/\./g, "$"));
    },
    escapeReferenceDeclarationText: (text: string) => {
      // console.log(`escapeDeclarationText3: ${text}` + `-> ${convertReservedWord(convertString(text))}`.padStart(100, " "));
      return convertReservedWord(convertString(text));
    },
    escapePropertySignatureName: (text: string) => {
      return Utils.escapeText(text);
    },
    escapeTypeReferenceNodeName: (text: string) => {
      return convertString(text);
    },
    generateResponseName: (operationId: string, statusCode: string): string => {
      return Utils.responseName(convertString(operationId), statusCode);
    },
    generateArgumentParamsTypeDeclaration: (operationId: string) => {
      return Utils.argumentParamsTypeDeclaration(convertString(operationId));
    },
    generateRequestContentTypeName: (operationId: string) => {
      return Utils.requestContentType(convertString(operationId));
    },
    generateResponseContentTypeName: (operationId: string) => {
      return Utils.responseContentType(convertString(operationId));
    },
    generateParameterName: (operationId: string) => {
      return Utils.parameterName(convertString(operationId));
    },
    generateRequestBodyName: (operationId: string) => {
      return Utils.requestBodyName(convertString(operationId));
    },
    generateFunctionName: (operationId: string) => {
      return convertString(operationId);
    },
    convertFormatTypeNode: schema => {
      const formatConversions = options?.formatConversions;
      if (!formatConversions || formatConversions.length === 0) {
        return;
      }
      if (typeof schema === "boolean") {
        return;
      }
      if (!schema.format) {
        return;
      }
      const target = formatConversions.find(formatConvertion => formatConvertion.selector.format === schema.format);
      if (!target) {
        return;
      }
      return createFormatSchemaToTypeNode(factory, target);
    },
  };
};
