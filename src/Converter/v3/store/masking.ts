import * as Def from "./Definition";
import * as State from "./State";

const maskingNamespace = (
  namespaceStatement: Def.NamespaceStatement<State.A, State.B, State.C>,
): Def.NamespaceStatement<State.A, State.B, State.C> => {
  const statements = Object.entries(namespaceStatement.statements).reduce<Def.StatementMap<State.A, State.B, State.C>>(
    (newStatement, [key, statement]) => {
      if (statement) {
        newStatement[key] = maskingStatement(statement);
      }
      return newStatement;
    },
    {},
  );
  return {
    type: "namespace",
    name: namespaceStatement.name,
    value: namespaceStatement.value.name.text as any,
    statements,
  };
};

const maskingInterface = (statement: Def.InterfaceStatement<State.B>): Def.InterfaceStatement<State.B> => {
  return {
    type: "interface",
    name: statement.name,
    value: statement.value.name.text as any,
  };
};

const maskingTypeAlias = (statement: Def.TypeAliasStatement<State.C>): Def.TypeAliasStatement<State.C> => {
  return {
    type: "typeAlias",
    name: statement.name,
    value: statement.value.name.text as any,
  };
};

const maskingStatement = (statement: Def.Statement<State.A, State.B, State.C>): Def.Statement<State.A, State.B, State.C> => {
  if (statement.type === "interface") {
    return maskingInterface(statement);
  }
  if (statement.type === "typeAlias") {
    return maskingTypeAlias(statement);
  }
  return maskingNamespace(statement);
};

export const maskValue = (state: State.Type): State.Type => {
  const kinds: Def.Statement<State.A, State.B, State.C>["type"][] = ["namespace", "typeAlias", "interface"];
  return Def.componentNames.reduce((newState, componentName) => {
    kinds.forEach(kind => {
      const key = Def.generateKey(kind, componentName);
      const component = state.components[key];
      if (!component) {
        return;
      }
      newState.components[key] = maskingStatement(component);
    });
    return newState;
  }, state);
};
