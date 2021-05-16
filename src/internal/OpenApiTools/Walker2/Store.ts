import * as fs from "fs";
import * as Path from "path";

import type { OpenApi, ParsedSchema, AbstractStruct } from "../../../types";
import * as Def from "./Definition";
import * as State from "./State";
import * as Structure from "./structure";

export { Structure };

class Store {
  private state: State.Type;
  private operator: Structure.OperatorType;
  private getChildByPaths: Structure.GetChildByPaths;
  constructor(rootDocument: OpenApi.Document) {
    this.state = State.createDefaultState(rootDocument);
    const { operator, getChildByPaths } = Structure.create();
    this.operator = operator;
    this.getChildByPaths = getChildByPaths;
  }
  public determineSchemaLocation(path: string, abstractDataStruct: AbstractStruct.SchemaLocation): void {
    const targetPath = Path.posix.relative("components", path);
    this.operator.set(targetPath, new Structure.OpenApiSchema.Item({ name: path, value: abstractDataStruct }));
  }
  public createDirectory(componentName: Def.ComponentName, componentProperty: Structure.DirectoryTreeProperty): void {
    this.operator.set(`${componentName}`, Structure.createInstance(componentProperty));
  }
  public isPossession(path: string): boolean {
    return !!this.operator.getChildByPaths(path, Structure.OpenApiSchema.Kind);
  }
  public debugAbstractDataStruct() {
    const data = this.operator.getHierarchy();
    console.log("output debug/hierarchy.json");
    fs.writeFileSync("debug/hierarchy.json", JSON.stringify(data, null, 2), { encoding: "utf-8" });
    fs.writeFileSync("debug/paths.json", JSON.stringify(this.operator.getNodePaths("OpenApiSchema"), null, 2), { encoding: "utf-8" });
  }
  public get accessor(): ParsedSchema.Accessor {
    return {
      operator: this.operator,
      getChildByPaths: this.getChildByPaths,
    };
  }
}

export { Store };
