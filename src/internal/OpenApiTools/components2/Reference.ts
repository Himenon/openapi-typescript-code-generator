import type { OpenApi } from "../../../types";
import type { InitializeParams } from "./types";

export class Locator {
  constructor(private readonly params: InitializeParams) {}


  public determine(currentPoint: string, schema: OpenApi.Reference) {

  }
}
