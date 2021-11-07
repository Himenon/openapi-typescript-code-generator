import * as Path from "path";

import { Tree } from "@himenon/path-oriented-data-structure";
import Dot from "dot-prop";
import ts from "typescript";

import type { OpenApi } from "../../../types";
import { UnSupportError } from "../../Exception";
import { Factory } from "../../TsGenerator";
import * as Def from "./Definition";
import * as Operation from "./Operation";
import * as State from "./State";
import * as Structure from "./structure";

export interface AddStatementOption {
  /**
   * pathに対して強制的にSchemaを上書きするフラグ
   * TypeAliasが先に登録され、Primitiveな型定義が登録されない問題を解決する
   */
  override?: boolean;
}

class Store {
  private state: State.Type;
  private operator: Structure.OperatorType;
  private getChildByPaths: Structure.GetChildByPaths;
  constructor(private factory: Factory.Type, rootDocument: OpenApi.Document) {
    this.state = State.createDefaultState(rootDocument);
    const { operator, getChildByPaths } = Structure.create();
    this.operator = operator;
    this.getChildByPaths = getChildByPaths;
  }

  public convertNamespace(tree: Tree<Structure.NamespaceTree.Kind> | Structure.NamespaceTree.Item): ts.Statement {
    const statements: ts.Statement[] = [];
    Object.values(tree.getChildren()).map(child => {
      if (child instanceof Tree || child instanceof Structure.NamespaceTree.Item) {
        statements.push(this.convertNamespace(child));
      } else if (child instanceof Structure.InterfaceNode.Item) {
        statements.push(child.value);
      } else if (child instanceof Structure.TypeAliasNode.Item) {
        statements.push(child.value);
      }
    });
    if (tree instanceof Structure.NamespaceTree.Item) {
      return this.factory.Namespace.create({
        export: true,
        name: tree.params.name,
        statements,
        comment: tree.params.comment,
        deprecated: tree.params.deprecated,
      });
    }
    return this.factory.Namespace.create({
      export: true,
      name: tree.name,
      statements,
    });
  }
  private capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  public getRootStatements(): ts.Statement[] {
    // Debug Point: 抽象的なデータ構造全体を把握するために出力すると良い
    // fs.writeFileSync("debug/tree.json", JSON.stringify(this.operator.getHierarchy(), null, 2), { encoding: "utf-8" });
    const statements = Def.componentNames.reduce<ts.Statement[]>((statements, componentName) => {
      const treeOfNamespace = this.getChildByPaths(componentName, "namespace");
      if (treeOfNamespace) {
        treeOfNamespace.name = this.capitalizeFirstLetter(treeOfNamespace.name);
        return statements.concat(this.convertNamespace(treeOfNamespace));
      }
      return statements;
    }, []);
    return statements;
  }
  public getAdditionalStatements(): ts.Statement[] {
    return this.state.additionalStatements;
  }
  /**
   * @params path: "components/headers/hoge"
   */
  public hasStatement(path: string, types: Structure.DataStructure.Kind[]): boolean {
    const alreadyRegistered = types.some(type => !!this.operator.getChildByPaths(path, type));
    return alreadyRegistered;
  }
  /**
   * @params path: "components/headers/hoge"
   */
  public addStatement(path: string, statement: Structure.ComponentParams, options?: AddStatementOption): void {
    if (!path.startsWith("components")) {
      throw new UnSupportError(`componentsから始まっていません。path=${path}`);
    }
    const targetPath = Path.posix.relative("components", path);
    // すでにinterfaceまたはNAMESPACEとして登録がある場合はスキップ
    if (this.hasStatement(targetPath, ["interface", "namespace"])) {
      return;
    }
    // もしTypeAliasが同じスコープに登録されているかつ、interfaceが新しく追加しようとしている場合、既存のstatementを削除する
    if (!!options?.override || (this.hasStatement(targetPath, ["typeAlias"]) && statement.kind === "interface")) {
      this.operator.remove(targetPath, "typeAlias");
    }
    this.operator.set(targetPath, Structure.createInstance(statement));
  }
  public getStatement<T extends Structure.DataStructure.Kind>(path: string, kind: T): Structure.DataStructure.GetChild<T> | undefined {
    const targetPath = Path.posix.relative("components", path);
    // components/schemasの場合
    if (path.split("/").length === 2 && kind === "namespace") {
      const child = this.getChildByPaths(targetPath, kind);
      if (child) {
        // FIXME Side Effect
        child.name = this.capitalizeFirstLetter(child.name);
      }
      return child;
    }
    return this.getChildByPaths(targetPath, kind);
  }
  public addComponent(componentName: Def.ComponentName, statement: Structure.ComponentParams): void {
    this.operator.set(`${componentName}`, Structure.createInstance(statement));
  }
  public getNoReferenceOperationState() {
    return Operation.create(this.state.document);
  }
  public updateOperationState(httpMethod: string, requestUri: string, operationId: string, newOperationState: Partial<State.OperationState>) {
    let operationState = this.state.operations[operationId];
    if (operationState) {
      operationState = { ...operationState, ...newOperationState };
    } else {
      operationState = State.createDefaultOperationState(httpMethod, requestUri, newOperationState);
    }
    this.state.operations[operationId] = operationState;
  }
  public addAdditionalStatement(statements: ts.Statement[]) {
    this.state.additionalStatements = this.state.additionalStatements.concat(statements);
  }
  public getPathItem(localPath: string): OpenApi.PathItem {
    if (!localPath.startsWith("components/pathItem")) {
      throw new Error("Only use start with 'component/pathItems': " + localPath);
    }
    const result = Dot.get<OpenApi.PathItem>(this.state.document, localPath.replace(/\//g, "."));
    if (!result) {
      throw new Error(`Not found ${localPath}`);
    }
    return result;
  }
  public getParameter(localPath: string): OpenApi.Parameter {
    if (!localPath.startsWith("components/parameters")) {
      throw new Error("Only use start with 'component/parameters': " + localPath);
    }
    const result = Dot.get<OpenApi.Parameter>(this.state.document, localPath.replace(/\//g, "."));
    if (!result) {
      throw new Error(`Not found ${localPath}`);
    }
    return result;
  }
  public isAfterDefined(referencePath: string): boolean {
    return !!Dot.get(this.state.document, referencePath.replace(/\//g, "."));
  }
}

export { Store };
