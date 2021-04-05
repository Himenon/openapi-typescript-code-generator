import * as path from "path";

import { Factory } from "../../CodeGenerator";
import * as ConverterContext from "../ConverterContext";
import * as Guard from "../Guard";
import * as Name from "../Name";
import { Store } from "../store";
import * as ToTypeNode from "../toTypeNode";
import { OpenApi } from "../types";
import * as Reference from "./Reference";
import * as RequestBody from "./RequestBody";

export const generateNamespace = (
  entryPoint: string,
  currentPoint: string,
  store: Store.Type,
  factory: Factory.Type,
  requestBodies: Record<string, OpenApi.RequestBody | OpenApi.Reference>,
  context: ToTypeNode.Context,
  converterContext: ConverterContext.Types,
): void => {
  const basePath = "components/requestBodies";
  store.addComponent("requestBodies", {
    kind: "namespace",
    name: Name.Components.RequestBodies,
  });

  Object.entries(requestBodies).forEach(([name, requestBody]) => {
    if (Guard.isReference(requestBody)) {
      const reference = Reference.generate<OpenApi.RequestBody>(entryPoint, currentPoint, requestBody);
      if (reference.type === "local") {
        throw new Error("not support");
      } else if (reference.type === "remote") {
        RequestBody.generateNamespace(
          entryPoint,
          reference.referencePoint,
          store,
          factory,
          path.dirname(reference.path),
          reference.name,
          reference.data,
          context,
          converterContext,
        );
      }
    } else {
      RequestBody.generateNamespace(entryPoint, currentPoint, store, factory, basePath, name, requestBody, context, converterContext);
    }
  });
};
