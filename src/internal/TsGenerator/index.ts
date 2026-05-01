import * as Factory from "./factory";

export * as Utils from "./utils";
export { type CreateFunction } from "./traverse";
export { Factory };

export const generate = (createFunction: import("./traverse").CreateFunction): string => {
  return createFunction().join("\n") + "\n";
};
