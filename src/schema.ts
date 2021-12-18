export type TypeOptions = {
  optional?: boolean;
  nullable?: boolean;
};

export type NumberType = {
  type: "number";
  options: TypeOptions;
  definition: string;
};

export type BooleanType = {
  type: "boolean";
  options: TypeOptions;
  definition: string;
};

export type StringType = {
  type: "string";
  options: TypeOptions;
  definition: string;
};

export type EnumType<T extends string> = {
  type: "enum";
  values: T[];
  options: TypeOptions;
  definition: string;
};

export type ArrayType<T extends AllType> = {
  type: "array";
  itemType: T;
  options: TypeOptions;
  definition: string;
};

export type TypeWithoutUnion<T extends AllType> = T extends UnionType<any> ? T["itemTypes"][number] : T;

export type UnionType<T extends AllType> = {
  type: "union";
  itemTypes: TypeWithoutUnion<T>[];
  options: TypeOptions;
  definition: string;
};

export type ObjectProperties = { [key in string]: AllType };

export type ObjectType<T extends ObjectProperties> = {
  type: "object";
  properties: T;
  options: TypeOptions;
  definition: string;
};

export type OptionalType<T extends AllType> = Omit<T, "options"> & { options: T["options"] & { optional: true } };

export type NullableType<T extends AllType> = Omit<T, "options"> & { options: T["options"] & { nullable: true } };

export type AllType =
  | NumberType
  | BooleanType
  | StringType
  | EnumType<any>
  | ArrayType<any>
  | ObjectType<any>
  | UnionType<any>;

export type Resolve<T extends AllType> = WithOptions<
  T extends { type: "number" }
    ? number
    : T extends { type: "string" }
    ? string
    : T extends { type: "boolean" }
    ? boolean
    : T extends { type: "enum" }
    ? T["values"][number]
    : T extends { type: "array" }
    ? Resolve<T["itemType"]>
    : T extends { type: "object" }
    ? UndefinedPropertyToOptional<{ [key in keyof T["properties"]]: Resolve<T["properties"][key]> }>
    : T extends { type: "union" }
    ? Resolve<T["itemTypes"][number]>
    : never,
  T["options"]
>;

type WithOptions<T extends any, O extends TypeOptions> = O extends { optional: true; nullable: true }
  ? T | null | undefined
  : O extends { nullable: true }
  ? T | null
  : O extends { optional: true }
  ? T | undefined
  : T;

type KeyOfUndefinedProperty<T extends Record<string, any>> = {
  [key in keyof T]: undefined extends T[key] ? key : never;
}[keyof T];

type UndefinedPropertyToOptional<T extends Record<string, any>> = Omit<T, KeyOfUndefinedProperty<T>> &
  Partial<Pick<T, KeyOfUndefinedProperty<T>>>;

export class Schema {
  public static Number(): NumberType {
    return { type: "number", options: {}, definition: "number" };
  }

  public static Boolean(): BooleanType {
    return { type: "boolean", options: {}, definition: "boolean" };
  }

  public static String(): StringType {
    return { type: "string", options: {}, definition: "string" };
  }

  public static Enum<T extends string>(values: T[]): EnumType<T> {
    return { type: "enum", values, options: {}, definition: values.map((value) => `"${value}"`).join(" | ") };
  }

  public static Array<T extends AllType>(itemType: T): ArrayType<T> {
    return { type: "array", itemType, options: {}, definition: `Array<${itemType.definition}>` };
  }

  public static Object<T extends ObjectProperties>(properties: T): ObjectType<T> {
    const pairs = Object.keys(properties).map((key) => {
      return [key, properties[key]] as const;
    });
    return {
      type: "object",
      properties,
      options: {},
      definition:
        pairs.length > 0
          ? `{ ${pairs
              .map((pair) =>
                pair[1].options.optional ? `${pair[0]}?: ${pair[1].definition}` : `${pair[0]}: ${pair[1].definition}`
              )
              .join(", ")} }`
          : "{}",
    };
  }

  public static Optional<T extends AllType>(type: T): OptionalType<T> {
    type.options.optional = true;
    return type as OptionalType<T>;
  }

  public static Nullable<T extends AllType>(type: T): NullableType<T> {
    type.options.nullable = true;
    type.definition = `${type.definition} | null`;
    return type as NullableType<T>;
  }

  public static Union<T extends AllType>(types: T[]): UnionType<T> {
    const uniquified = (() => {
      const flattend = types
        .map((type) => {
          if (type.type === "union") {
            return type.itemTypes;
          }
          return type;
        })
        .flat() as TypeWithoutUnion<T>[];
      return Array.from(new Map(flattend.map((type) => [JSON.stringify(type.definition), type]))).map(
        ([, type]) => type
      );
    })();

    return {
      type: "union",
      itemTypes: uniquified,
      options: {},
      definition: uniquified.map((type) => type.definition).join(" | "),
    };
  }
}
