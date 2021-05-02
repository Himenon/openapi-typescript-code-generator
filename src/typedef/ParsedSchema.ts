import type * as PathOrientedDataStructure from "@himenon/path-oriented-data-structure";

import type * as Walker from "../internal/OpenApiTools/Walker2";

export interface Accessor {
  operator: PathOrientedDataStructure.Operator<Walker.Structure.Directory.Kind>;
  getChildByPaths: Walker.Structure.GetChildByPaths;
}
