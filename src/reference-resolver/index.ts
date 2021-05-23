import * as fs from "fs";

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
  private resolvedLocalReferenceState: ResolvedReference = {};
  private resolvedRemoteReferenceState: ResolvedReference = {};
  private document: OpenApi.Document | undefined;
  constructor(private readonly entryPoint: string, private infra: Infra) {}
  public async init(): Promise<void> {
    this.document = this.infra.loadJsonOrYaml(this.entryPoint);
    await this.resolveReference();
  }

  private async resolveReference(): Promise<void> {
    if (!this.document) {
      return;
    }
    await this.resolveValue(this.entryPoint, this.document, "OpenApiSchema");
    fs.writeFileSync("debug/resolved-local-reference-schema.json", JSON.stringify(this.resolvedLocalReferenceState, null, 2), {
      encoding: "utf-8",
    });
    fs.writeFileSync("debug/resolved-remote-reference-schema.json", JSON.stringify(this.resolvedRemoteReferenceState, null, 2), {
      encoding: "utf-8",
    });
  }

  private isLocalReference($ref: string): boolean {
    return $ref.startsWith("#");
  }

  private async resolveValue(currentPoint: string, value: any, parentKey?: string): Promise<any> {
    if (OpenApiTools.Guard.isReference(value)) {
      if (this.isLocalReference(value.$ref)) {
        return this.resolveLocalReference(currentPoint, value, parentKey);
      } else {
        return this.resolveRemoteReference(currentPoint, value, parentKey);
      }
    } else if (PrimitiveTypeGuard.isArray(value)) {
      return value.map((item, idx) => this.resolveValue(currentPoint, item, [parentKey, idx].join(".")));
    } else if (PrimitiveTypeGuard.isObject(value)) {
      Object.entries(value).forEach(async ([k, v]) => {
        value[k] = await this.resolveValue(currentPoint, v, [parentKey, k].join("."));
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
    const resolvedValue = await this.resolveValue(currentPoint, data);
    this.resolvedLocalReferenceState[referencePoint] = resolvedValue;
    return resolvedValue;
  }

  private async resolveRemoteReference(currentPoint: string, obj: OpenApi.Reference, parentKey?: string): Promise<any> {
    if (obj.$ref.startsWith("http")) {
      throw new Error("これから");
    } else {
      const referencePoint = ReferencePath.generateReferencePoint(currentPoint, obj.$ref);
      const data = this.infra.loadJsonOrYaml(referencePoint);
      const resolvedValue = await this.resolveValue(referencePoint, data);
      this.resolvedRemoteReferenceState[referencePoint] = resolvedValue;
      return resolvedValue;
    }
  }

  private findSchema(currentPoint: string, $ref: string) {
    if (this.isLocalReference($ref)) {
      const searchPoint = ReferencePath.normalizeLocalReferencePoint($ref);
      return this.resolvedLocalReferenceState[searchPoint];
    } else {
      const searchPoint = ReferencePath.normalizeRemoteReferencePoint(currentPoint, $ref);
      return this.resolvedRemoteReferenceState[searchPoint];
    }
  }

  public getSchema(currentPoint: string, $ref: string) {
    const result = this.findSchema(currentPoint, $ref);
    if (!result) {
      console.log({
        currentPoint,
        $ref,
        localSearchPoint: ReferencePath.normalizeLocalReferencePoint($ref),
        remoteSearchPoint: ReferencePath.normalizeRemoteReferencePoint(currentPoint, $ref),
      });
      throw new Error("Not found schema");
    }
    return result;
  }
}
