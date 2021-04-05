import { EOL } from "os";

import * as DefaultCodeTemplate from "./DefaultCodeTemplate";
import * as TsGenerator from "./internal/CodeGenerator";
import { OpenApi, Parser, generateLeading } from "./internal/Converter";
import { fileSystem } from "./internal/FileSystem";
import * as ResolveReference from "./internal/ResolveReference";
import * as Validator from "./internal/Validator";
import * as Types from "./types";

export { Parser, DefaultCodeTemplate };

export interface GeneratorTemplate<T> {
  generator: Types.CodeGenerator.GenerateFunction<T>;
  option?: T;
}

export class CodeGenerator {
  private rootSchema: OpenApi.Document;
  private resolvedReferenceDocument: OpenApi.Document;
  private parser: Parser;
  constructor(private readonly entryPoint: string) {
    this.rootSchema = fileSystem.loadJsonOrYaml(entryPoint);
    this.resolvedReferenceDocument = ResolveReference.resolve(entryPoint, entryPoint, JSON.parse(JSON.stringify(this.rootSchema)));
    this.parser = this.createParser();
  }

  private createParser(allowOperationIds?: string[]): Parser {
    return new Parser(this.entryPoint, this.rootSchema, this.resolvedReferenceDocument, {
      allowOperationIds: allowOperationIds,
    });
  }

  public validate(config?: Types.Validator.Configuration) {
    if (!config) {
      Validator.validate(this.resolvedReferenceDocument);
    } else {
      Validator.validate(this.resolvedReferenceDocument, config.logger);
    }
  }

  public generateTypeDefinition<T = {}>(generatorTemplate?: GeneratorTemplate<T>): string {
    const create = () => {
      const statements = this.parser.getTypeDefinitionStatements();
      if (generatorTemplate) {
        const payload = this.parser.getCodeGeneratorParamsArray();
        const extraStatements = TsGenerator.Utils.convertIntermediateCodes(generatorTemplate.generator(payload, generatorTemplate.option));
        return statements.concat(extraStatements);
      }
      return statements;
    };
    return [generateLeading(this.resolvedReferenceDocument), TsGenerator.generate(create)].join(EOL + EOL + EOL);
  }

  public generateCode<T>(generatorTemplate: GeneratorTemplate<T>): string {
    const payload = this.parser.getCodeGeneratorParamsArray();
    const create = () => TsGenerator.Utils.convertIntermediateCodes(generatorTemplate?.generator(payload, generatorTemplate.option));
    return [generateLeading(this.resolvedReferenceDocument), TsGenerator.generate(create)].join(EOL + EOL + EOL);
  }
}
