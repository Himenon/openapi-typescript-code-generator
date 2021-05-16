import type { OpenApi } from "../../../types";
import * as Guard from "../Guard";
import * as InferredType from "../InferredType";
import * as Name from "../Name";
import type { Payload } from "../types/tmp";
import type * as Walker from "../Walker2";
import * as Reference from "./Reference";

export const determineSchemaLocation = (
  payload: Payload,
  store: Walker.Store,
  schemas: Record<string, OpenApi.Schema | OpenApi.Reference>,
): void => {
  const basePath = "components/schemas";
  store.createDirectory("schemas", {
    kind: "directory",
    name: Name.Components.Schemas,
  });
  Object.entries(schemas).forEach(([name, targetSchema]) => {
    if (Guard.isReference(targetSchema)) {
      const schema = targetSchema;
      const reference = Reference.generate<OpenApi.Schema>(payload.entryPoint, payload.currentPoint, schema);
      if (reference.type === "local") {
        store.determineSchemaLocation(`${basePath}/${name}`, {
          kind: "reference",
          referenceType: "local",
          resolvedPath: `${basePath}/${name}`,
          schema: schema,
        });
        return;
      }
      store.determineSchemaLocation(reference.path, {
        kind: "common",
        schema: schema,
      });
      if (store.isPossession(`${basePath}/${name}`)) {
        return;
      }
      store.determineSchemaLocation(`${basePath}/${name}`, {
        kind: "reference",
        referenceType: "remote",
        schema: reference.data,
        resolvedPath: `${basePath}/${name}`,
      });
      return;
    }
    const schema = InferredType.getInferredType(targetSchema);
    if (schema) {
      const path = `${basePath}/${name}`;
      store.determineSchemaLocation(path, {
        kind: "common",
        schema: schema,
      });
    }
  });
};
