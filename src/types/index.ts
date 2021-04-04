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
    openapiSchema?: boolean;
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
   * The parameters specified here will be passed directly to the Code Generate function.
   */
  export interface Option {
    sync?: boolean;
  }

  /**
   * Used to further transform the code created by the specified Generator Template.
   */
  export type IntermediateCode = string | ts.Statement;

  export type GenerateFunction = (context: ts.TransformationContext, payload: CodeGeneratorParams[], option: Option) => IntermediateCode[];

  export interface OutputConfiguration {
    /**
     * Template Name
     */
    template: string;
    /**
     *
     */
    transform?: (params: IntermediateCode) => IntermediateCode[];
  }

  export interface Configuration {
    /**
     * Code generatorOption
     */
    option: Option;
    /**
     * Output files
     */
    outputs: OutputConfiguration[];
    /**
     * Register template
     */
    templates: Record<string, GenerateFunction>;
  }
}

export namespace TypeDefinitionGenerator {
  export interface Configuration {
    generateCodeAfterGeneratedTypeDefinition: CodeGenerator.OutputConfiguration;
  }
}

export namespace TypeScriptCodeGenerator {
  export interface Configuration {
    entryPoint: string;
    typeDefinitionGenerator?: TypeDefinitionGenerator.Configuration;
    validator?: Validator.Configuration;
    openApiSchemaParser?: OpenApiSchemaParser.Configuration;
    codeGenerator?: CodeGenerator.Configuration;
  }

  export interface GeneratedCode {
    value: string;
  }

  export interface Output {
    typeDefinition: GeneratedCode;
    additionalCodes: Record<string, GeneratedCode>;
  }
}
