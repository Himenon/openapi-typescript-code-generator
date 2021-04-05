import ts from "typescript";

import type { CodeGenerator, OpenApi } from "../../types";
import * as TypeScriptCodeGenerator from "../TsGenerator";
import * as CodeGenerator2 from "./CodeGenerator";
import * as Headers from "./components/Headers";
import * as Parameters from "./components/Parameters";
import * as RequestBodies from "./components/RequestBodies";
import * as Responses from "./components/Responses";
import * as Schemas from "./components/Schemas";
import * as ConvertContext from "./ConverterContext";
import * as Name from "./Name";
import * as Paths from "./paths";
import { Store } from "./store";
import * as TypeNodeContext from "./TypeNodeContext";

export { generateLeading } from "./Comment";

export { OpenApi, CodeGenerator2 as CodeGenerator, Name };

export interface Option {
  /**
   * List of operationId to be used
   */
  allowOperationIds?: string[];
}

export interface Result {
  typeDefinitionStatements: ts.Statement[];
  params: CodeGenerator.Params;
}

export class Parser {
  private currentPoint: string;
  private convertContext: ConvertContext.Types;
  private store: Store.Type;
  private factory: TypeScriptCodeGenerator.Factory.Type;
  constructor(
    private entryPoint: string,
    private rootSchema: OpenApi.Document,
    noReferenceOpenApiSchema: OpenApi.Document,
    private option: Option,
  ) {
    this.currentPoint = entryPoint;
    this.convertContext = ConvertContext.create();
    this.factory = TypeScriptCodeGenerator.Factory.create();
    this.store = Store.create(this.factory, noReferenceOpenApiSchema);
    this.initialize();
  }

  private initialize(): void {
    const toTypeNodeContext = TypeNodeContext.create(this.entryPoint, this.store, this.factory, this.convertContext);
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

  public getCodeGeneratorParamsArray(): CodeGenerator.Params[] {
    return CodeGenerator2.generateCodeGeneratorParamsArray(this.store, this.convertContext, this.option.allowOperationIds);
  }

  public getTypeDefinitionStatements(): ts.Statement[] {
    return this.store.getRootStatements();
  }
}
