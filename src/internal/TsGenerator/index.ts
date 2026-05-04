import * as Factory from "./factory";
<<<<<<< HEAD
=======
import { type CreateFunction, traverse } from "./traverse";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

export { Factory };

export type CreateFunction = () => string[];

export const generate = (createFunction: CreateFunction): string => {
  return createFunction().join("\n") + "\n";
};
