import * as Factory from "./factory";

export { Factory };

export type CreateFunction = () => string[];

export const generate = (createFunction: CreateFunction): string => {
  return `${createFunction().join("\n")}\n`;
};
