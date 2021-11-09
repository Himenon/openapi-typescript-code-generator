import ts from "typescript";

import type { CodeGenerator, OpenApi } from "../../types";
import * as TypeScriptCodeGenerator from "../TsGenerator";
import * as Headers from "./components/Headers";
import * as Parameters from "./components/Parameters";
import * as RequestBodies from "./components/RequestBodies";
import * as Responses from "./components/Responses";
import * as Schemas from "./components/Schemas";
import * as ConvertContext from "./ConverterContext";
import * as Extractor from "./Extractor";
import * as Paths from "./paths";
import * as TypeNodeContext from "./TypeNodeContext";
import { Store } from "./Walker";

export { ConvertContext };

export class Parser {
  private currentPoint: string;
  private convertContext: ConvertContext.Types;
  private store: Store;
  private factory: TypeScriptCodeGenerator.Factory.Type;
  constructor(private entryPoint: string, private readonly rootSchema: OpenApi.Document, noReferenceOpenApiSchema: OpenApi.Document, convertOption?: ConvertContext.Options) {
    this.currentPoint = entryPoint;
    this.factory = TypeScriptCodeGenerator.Factory.create();
    this.convertContext = ConvertContext.create(this.factory, convertOption);
    this.store = new Store(this.factory, noReferenceOpenApiSchema);
    this.initialize();
  }

  private initialize(): void {
    const toTypeNodeContext = TypeNodeContext.create(this.entryPoint, this.rootSchema, this.store, this.factory, this.convertContext);
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
          this.convertContext,
        );
      }
      if (rootSchema.components.headers) {
        Headers.generateNamespace(
          this.entryPoint,
          this.currentPoint,
          this.store,
          this.factory,
          rootSchema.components.headers,
          toTypeNodeContext,
          this.convertContext,
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
          this.convertContext,
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
          this.convertContext,
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
          this.convertContext,
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
        this.convertContext,
      );
    }
  }

  public getCodeGeneratorParamsArray(allowOperationIds?: string[]): CodeGenerator.Params[] {
    return Extractor.generateCodeGeneratorParamsArray(this.store, this.convertContext, allowOperationIds);
  }

  public getOpenApiTypeDefinitionStatements(): ts.Statement[] {
    return this.store.getRootStatements();
  }

  public getAdditionalTypeStatements(): ts.Statement[] {
    return this.store.getAdditionalStatements();
  }
}
