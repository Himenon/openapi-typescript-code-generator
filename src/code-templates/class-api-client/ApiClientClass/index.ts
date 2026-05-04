<<<<<<< HEAD
=======
import type ts from "typescript";

>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879
import type { TsGenerator } from "../../../api";
import type { CodeGenerator } from "../../../types";
import * as ApiClientInterface from "../../_shared/ApiClientInterface";
import type { Option } from "../../_shared/types";
import * as Class from "./Class";
import * as Constructor from "./Constructor";
import * as Method from "./Method";

export { Method };

export const create = (factory: TsGenerator.Factory.Type, list: CodeGenerator.Params[], option: Option): string[] => {
  const methodList = list.map(params => {
    return Method.create(factory, params, option);
  });
  const members = [Constructor.create(factory), ...methodList];
  return [...ApiClientInterface.create(factory, list, "class", option), Class.create(factory, members)];
};
