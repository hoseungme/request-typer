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

export type EnumType = {
  type: "enum";
  values: string[];
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
  | EnumType
  | ArrayType<any>
  | ObjectType<any>
  | UnionType<any>;

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

  public static Enum(values: string[]): EnumType {
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
          ? `{\n${pairs
              .map(
                (pair) =>
                  `  ${
                    pair[1].options.optional
                      ? `${pair[0]}?: ${pair[1].definition}`
                      : `${pair[0]}: ${pair[1].definition}`
                  }`
              )
              .join(",\n")}\n}`
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
      return Array.from(new Map(flattend.map((type) => [JSON.stringify(type.definition), type]))).map(([, type]) => type);
    })();

    return {
      type: "union",
      itemTypes: uniquified,
      options: {},
      definition: uniquified.map((type) => type.definition).join(" | "),
    };
  }
}
