import { EOL } from "os";

import * as Api from "./api";
import type * as Types from "./types";

export interface Option {
  allowOperationIds?: string[];
  convertOption: Api.OpenApiTools.ConvertContext.Options;
}

export class CodeGenerator {
  private rootSchema: Types.OpenApi.Document;
  private resolvedReferenceDocument: Types.OpenApi.Document;
  private parser: Api.OpenApiTools.Parser;
  constructor(private readonly entryPoint: string, private option?: Option) {
    this.rootSchema = Api.FileSystem.loadJsonOrYaml(entryPoint);
    this.resolvedReferenceDocument = Api.ResolveReference.resolve(entryPoint, entryPoint, JSON.parse(JSON.stringify(this.rootSchema)));
    this.parser = this.createParser();
  }

  private createParser(): Api.OpenApiTools.Parser {
    return new Api.OpenApiTools.Parser(this.entryPoint, this.rootSchema, this.resolvedReferenceDocument, this.option?.convertOption);
  }

  /**
   * Validate the OpenAPI Schema
   */
  public validateOpenApiSchema(option?: Types.Validator.Option) {
    if (!option) {
      Api.Validator.validate(this.resolvedReferenceDocument);
    } else {
      Api.Validator.validate(this.resolvedReferenceDocument, option.logger);
    }
  }

  /**
   * Provides TypeScript typedefs generated from OpenAPI Schema.
   *
   * @param generatorTemplate Template for when you want to change the code following a type definition
   * @returns String of generated code
   */
  public generateTypeDefinition(generatorTemplates?: Types.CodeGenerator.CustomGenerator<any>[], allowOperationIds?: string[]): string {
    const create = () => {
      const statements = this.parser.getOpenApiTypeDefinitionStatements();
      generatorTemplates?.forEach(generatorTemplate => {
        const payload = this.parser.getCodeGeneratorParamsArray(allowOperationIds);
        const extraStatements = Api.TsGenerator.Utils.convertIntermediateCodes(generatorTemplate.generator(payload, generatorTemplate.option));
        statements.push(...extraStatements);
      });
      return statements;
    };
    return [Api.OpenApiTools.Comment.generateLeading(this.resolvedReferenceDocument), Api.TsGenerator.generate(create)].join(EOL + EOL + EOL);
  }

  /**
   * Generate code using a template
   *
   * @param generatorTemplate
   * @returns String of generated code
   */
  public generateCode(generatorTemplates: Types.CodeGenerator.CustomGenerator<any>[], allowOperationIds?: string[]): string {
    const payload = this.parser.getCodeGeneratorParamsArray(allowOperationIds);
    const create = () => {
      return generatorTemplates
        .map(generatorTemplate => {
          return Api.TsGenerator.Utils.convertIntermediateCodes(generatorTemplate?.generator(payload, generatorTemplate.option));
        })
        .flat();
    };
    return [Api.OpenApiTools.Comment.generateLeading(this.resolvedReferenceDocument), Api.TsGenerator.generate(create)].join(EOL + EOL + EOL);
  }

  /**
   * Provides parameters extracted from OpenApi Schema
   */
  public getCodeGeneratorParamsArray(allowOperationIds?: string[]): Types.CodeGenerator.Params[] {
    return this.parser.getCodeGeneratorParamsArray(allowOperationIds);
  }

  /**
   * Provides types for parameters for Templates.ApiClient.
   *
   * This API will be moved to Templates in the future.
   */
  public getAdditionalTypeDefinitionCustomCodeGenerator(): Types.CodeGenerator.CustomGenerator<undefined> {
    return {
      generator: () => this.parser.getAdditionalTypeStatements(),
    };
  }
}
