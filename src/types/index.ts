import type ts from "typescript";

import type { CodeGeneratorParams } from "./extractSchema";

export namespace Validator {
  export interface Logger {
    /**
     * default: undefined (all logs)
     * Number of lines displayed in the latest log
     */
    displayLogLines?: number;
  }
  export interface Configuration {
    logger?: Logger;
  }
}

export namespace OpenApiSchemaParser {
  export interface Configuration {
    allowOperationIds?: string[];
  }
}

export namespace CodeGenerator {
  /**
   * Used to further transform the code created by the specified Generator Template.
   */
  export type IntermediateCode = string | ts.Statement;

  export type GenerateFunction<Option = {}> = (payload: CodeGeneratorParams[], option?: Option) => IntermediateCode[];

  export interface OutputConfiguration {
    /**
     *
     */
    transform?: (params: IntermediateCode) => IntermediateCode[];
  }
}

export namespace TypeDefinitionGenerator {
  export interface Configuration {
    additional?: CodeGenerator.OutputConfiguration;
  }
}

export namespace OpenApiTsCodeGen {
  export interface Configuration {
    entryPoint: string;
  }
}
