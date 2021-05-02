import * as fs from "fs";
import * as Path from "path";

import type { OpenApi, ParsedSchema } from "../../../types";
import * as ADS from "../../AbstractDataStructure";
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
  public addAbstractDataStruct(path: string, abstractDataStruct: ADS.Struct): void {
    const targetPath = Path.posix.relative("components", path);
    this.operator.set(targetPath, new Structure.AbstractDataStructure.Item({ name: path, value: abstractDataStruct }));
  }
  public createDirectory(componentName: Def.ComponentName, componentProperty: Structure.DirectoryTreeProperty): void {
    this.operator.set(`${componentName}`, Structure.createInstance(componentProperty));
  }
  public existTypeDef(path: string): boolean {
    return !!this.operator.getChildByPaths(path, Structure.AbstractDataStructure.Kind);
  }
  public debugAbstractDataStruct() {
    const data = this.operator.getHierarchy();
    console.log("output");
    fs.writeFileSync("debug/hierarchy.json", JSON.stringify(data, null, 2), { encoding: "utf-8" });
    fs.writeFileSync("debug/paths.json", JSON.stringify(this.operator.getNodePaths("typedef"), null, 2), { encoding: "utf-8" });
  }
  public get accessor(): ParsedSchema.Accessor {
    return {
      operator: this.operator,
      getChildByPaths: this.getChildByPaths,
    };
  }
}

export { Store };
