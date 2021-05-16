import ts from "typescript";

import type { CodeGenerator, OpenApi, ParsedSchema } from "../../types";
import * as TypeScriptCodeGenerator from "../TsGenerator";
import * as Headers from "./components/Headers";
import * as Parameters from "./components/Parameters";
import * as RequestBodies from "./components/RequestBodies";
import * as Responses from "./components/Responses";
import * as Schemas from "./components/Schemas";
import * as Schemas2 from "./components2/Schemas";
import * as ConvertContext from "./ConverterContext";
import * as Extractor from "./Extractor";
import * as Paths from "./paths";
import * as StructContext from "./StructContext";
import * as TypeNodeContext from "./TypeNodeContext";
import * as Walker from "./Walker";
import * as Walker2 from "./Walker2";

export class Parser {
  private currentPoint: string;
  private converterContext = ConvertContext.create();
  private store: Walker.Store;
  private store2: Walker2.Store;
  private factory: TypeScriptCodeGenerator.Factory.Type;
  private schemaLocator: Schemas2.Locator;
  constructor(private entryPoint: string, private rootSchema: OpenApi.Document, noReferenceOpenApiSchema: OpenApi.Document) {
    this.currentPoint = entryPoint;
    this.factory = TypeScriptCodeGenerator.Factory.create();
    this.store = new Walker.Store(this.factory, noReferenceOpenApiSchema);
    this.store2 = new Walker2.Store(noReferenceOpenApiSchema);
    this.schemaLocator = new Schemas2.Locator({
      entryPoint,
      store: this.store2,
    });
    this.initialize();
  }

  private initialize(): void {
    const toTypeNodeContext = TypeNodeContext.create(this.entryPoint, this.store, this.factory, this.converterContext);
    const structContext = StructContext.create(this.entryPoint, this.store, this.factory, this.converterContext);
    const rootSchema = this.rootSchema;
    if (rootSchema.components) {
      if (rootSchema.components.schemas) {
        Schemas.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.schemas,
          toTypeNodeContext,
          this.converterContext,
        );
        this.schemaLocator.determine(rootSchema.components.schemas);
      }
      if (rootSchema.components.headers) {
        Headers.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.headers,
          toTypeNodeContext,
          this.converterContext,
        );
      }
      if (rootSchema.components.responses) {
        Responses.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.responses,
          toTypeNodeContext,
          this.converterContext,
        );
      }
      if (rootSchema.components.parameters) {
        Parameters.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.parameters,
          toTypeNodeContext,
          this.converterContext,
        );
      }
      if (rootSchema.components.requestBodies) {
        RequestBodies.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.requestBodies,
          toTypeNodeContext,
          this.converterContext,
        );
      }
      // if (rootSchema.components.securitySchemes) {
      //   SecuritySchemas.generateNamespace(this.entryPoint, currentPoint, store, factory, rootSchema.components.securitySchemes);
      // }
      // if (rootSchema.components.pathItems) {
      //   PathItems.generateNamespace(this.entryPoint, currentPoint, store, factory, rootSchema.components.pathItems, toTypeNodeContext);
      // }
      // TODO Feature Development
      // if (rootSchema.components.links) {
      //   statements.push(Links.generateNamespace(this.entryPoint, currentPoint, factory, rootSchema.components.links));
      // }

      // TODO Feature Development
      // if (rootSchema.components.callbacks) {
      //   statements.push(Callbacks.generateNamespace(this.entryPoint, currentPoint, factory, rootSchema.components.callbacks));
      // }
    }
    if (rootSchema.paths) {
      Paths.generateStatements(
        this.entryPoint,
        this.currentPoint,
        this.store,
        this.factory,
        rootSchema.paths,
        toTypeNodeContext,
        this.converterContext,
      );
    }
    this.store2.debugAbstractDataStruct();
  }

  /**
   * 抽象化されたAccessor
   */
  public get accessor(): ParsedSchema.Accessor {
    return this.store2.accessor;
  }

  public getCodeGeneratorParamsArray(allowOperationIds?: string[]): CodeGenerator.Params[] {
    return Extractor.generateCodeGeneratorParamsArray(this.store, this.converterContext, allowOperationIds);
  }

  /**
   *
   * @returns 依存を排除する
   */
  public getOpenApiTypeDefinitionStatements(): ts.Statement[] {
    return this.store.getRootStatements();
  }

  public getAdditionalTypeStatements(): ts.Statement[] {
    return this.store.getAdditionalStatements();
  }
}
