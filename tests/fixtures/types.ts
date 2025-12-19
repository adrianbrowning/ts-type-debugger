/**
 * Reusable TypeScript type definitions for tests
 */

export const SIMPLE_TYPES = {
  identity: "type Identity<T> = T;",
  conditional: "type IsString<T> = T extends string ? true : false;",
  mapped: "type Readonly<T> = { readonly [K in keyof T]: T[K] };",
  template: "type Prefixed<S> = `prefix_${S}`;",
  indexed: "type GetProp<T, K extends keyof T> = T[K];",
  union: "type StringOrNumber = string | number;",
};

export const COMPLEX_TYPES = {
  unionStepping: `
    type Loop2<str> = str extends "a" ? 1
      : str extends "b" ? 2
      : never;
  `,
  templateCartesian: `
    type Grid<A, B> = \`\${A}-\${B}\`;
  `,
  nestedConditionals: `
    type Nested<T> = T extends string
      ? T extends "a"
        ? 1
        : 2
      : 3;
  `,
  deepReadonly: `
    type DeepReadonly<T> = {
      readonly [K in keyof T]: T[K] extends object
        ? DeepReadonly<T[K]>
        : T[K];
    };
  `,
  pick: `
    type MyPick<T, K extends keyof T> = {
      [P in K]: T[P];
    };
  `,
  omit: `
    type MyOmit<T, K extends keyof T> = {
      [P in Exclude<keyof T, K>]: T[P];
    };
  `,
  getterFromBase: `
    type tables = {
      User: { id: number; name: string };
      Post: { id: number; title: string };
    };
    type keyOf<o> = {[k in keyof o]: k extends string ? k : never}[keyof o];
    type getKey<o, k> = k extends keyof o ? o[k] : never;
    type isLeaf<T> = [keyof T] extends [never] ? true : false;
    type getLeafPaths<o, prefix extends string = ""> = {
      [k in keyOf<o>]: isLeaf<getKey<o, k>> extends true
        ? \`\${prefix}\${k}\`
        : getLeafPaths<getKey<o, k>, \`\${prefix}\${k}.\`>
    }[keyOf<o>];
    type validateLeafPath<o, path extends string, prefix extends string = ""> =
      path extends \`\${infer head}.\${infer tail}\`
        ? head extends keyOf<o>
          ? validateLeafPath<getKey<o, head>, tail, \`\${prefix}\${head}.\`>
          : never
        : path extends keyOf<o>
          ? isLeaf<getKey<o, path>> extends true
            ? \`\${prefix}\${path}\`
            : never
          : never;
    type getter<path extends string> = path extends validateLeafPath<tables, path>
      ? path
      : validateLeafPath<tables, path>;
  `,
};

export const EDGE_CASES = {
  emptyUnion: "type Empty = never;",
  recursiveType: "type Json = string | number | boolean | null | Json[] | { [key: string]: Json };",
  distributiveConditional: "type ToArray<T> = T extends any ? T[] : never;",
  nonDistributiveConditional: "type NoDistribute<T> = [T] extends [any] ? T[] : never;",
  templateWithNumber: "type NumberTemplate = `value-${1 | 2 | 3}`;",
  complexMapped: "type Optional<T> = { [K in keyof T]?: T[K] };",
};
