import DotProp from "dot-prop";

import { OpenApiTools } from "../api";
import { OpenApi } from "../types";
import { ReferencePath } from "../utils";
import * as PrimitiveTypeGuard from "./PrimitiveTypeGuard";

export type ResolvedReference = Record<string, any>;

export interface Infra {
  loadJsonOrYaml: (entryPoint: string) => any;
}

export class Resolver {
  private resolvedReference: ResolvedReference = {};
  private document: OpenApi.Document = {};
  constructor(private readonly entryPoint: string, private infra: Infra) {}
  public async init(): Promise<void> {
    this.document = this.infra.loadJsonOrYaml(this.entryPoint);
  }
  private async resolveReference(): Promise<void> {}

  private async resolveValue(currentPoint: string, value: any, parentKey?: string): Promise<any> {
    if (OpenApiTools.Guard.isReference(value)) {
      if (value.$ref.startsWith("#")) {
        return this.resolveLocalReference(currentPoint, value, parentKey);
      } else {
        return this.resolveRemoteReference(currentPoint, value, parentKey);
      }
    } else if (PrimitiveTypeGuard.isArray(value)) {
      return value.map((item, idx) => this.resolveValue(currentPoint, item, [parentKey, idx].join(".")));
    } else if (PrimitiveTypeGuard.isObject(value)) {
      Object.entries(value).forEach(([key, value]) => {
        value[key] = this.resolveValue(currentPoint, value, [parentKey, key].join("."));
      });
    }
    return value;
  }

  private async resolveLocalReference(currentPoint: string, obj: OpenApi.Reference, parentKey?: string): Promise<any> {
    if (!this.document) {
      throw new Error(`Uninitialized Error`);
    }
    const localReference = ReferencePath.generateLocalReference(obj.$ref);
    if (!localReference) {
      throw new Error(`Not found local reference: ${obj.$ref}`);
    }
    const referencePoint = localReference.path;
    const data = DotProp.get(this.document, referencePoint.replace(/\//g, "."));
    const resolvedValue = this.resolveValue(currentPoint, data);

    this.resolvedReference[referencePoint] = resolvedValue;
    return resolvedValue;
  }

  private async resolveRemoteReference(currentPoint: string, obj: OpenApi.Reference, parentKey?: string): Promise<any> {
    if (obj.$ref.startsWith("http")) {
      throw new Error("これから");
    } else {
      const referencePoint = ReferencePath.generateReferencePoint(currentPoint, obj.$ref);
      const data = this.infra.loadJsonOrYaml(referencePoint);

      const resolvedValue = this.resolveValue(referencePoint, data);
      this.resolvedReference[referencePoint] = resolvedValue;
      return resolvedValue;
    }
  }

  public getSchema(entryPoint: string, currentPoint: string, $ref: string) {}
}
