export type SchemaOptions = {
  optional?: boolean;
  nullable?: boolean;
};

export type NumberSchema = {
  type: "number";
  options: SchemaOptions;
  definition: string;
};

export type BooleanSchema = {
  type: "boolean";
  options: SchemaOptions;
  definition: string;
};

export type StringSchema = {
  type: "string";
  options: SchemaOptions;
  definition: string;
};

export type EnumSchema<T extends string> = {
  type: "enum";
  values: T[];
  options: SchemaOptions;
  definition: string;
};

export type ArraySchema<T extends AllSchema> = {
  type: "array";
  itemSchema: T;
  options: SchemaOptions;
  definition: string;
};

export type SchemaWithoutUnion<T extends AllSchema> = T extends UnionSchema<any> ? T["itemSchemas"][number] : T;

export type UnionSchema<T extends AllSchema> = {
  type: "union";
  itemSchemas: SchemaWithoutUnion<T>[];
  options: SchemaOptions;
  definition: string;
};

export type ObjectProperties = { [key in string]: AllSchema };

export type ObjectSchema<T extends ObjectProperties> = {
  type: "object";
  properties: T;
  options: SchemaOptions;
  definition: string;
};

export type DictSchema<T extends AllSchema> = {
  type: "dict";
  valueSchema: T;
  options: SchemaOptions;
  definition: string;
};

export type OptionalSchema<T extends AllSchema> = Omit<T, "options"> & { options: T["options"] & { optional: true } };

export type NullableSchema<T extends AllSchema> = Omit<T, "options"> & { options: T["options"] & { nullable: true } };

export type AllSchema =
  | NumberSchema
  | BooleanSchema
  | StringSchema
  | EnumSchema<any>
  | ArraySchema<any>
  | ObjectSchema<any>
  | UnionSchema<any>
  | DictSchema<any>;

export type Resolve<T extends AllSchema> = WithOptions<
  T extends { type: "number" }
    ? number
    : T extends { type: "string" }
    ? string
    : T extends { type: "boolean" }
    ? boolean
    : T extends { type: "enum" }
    ? T["values"][number]
    : T extends { type: "array" }
    ? Resolve<T["itemSchema"]>
    : T extends { type: "object" }
    ? UndefinedPropertyToOptional<{ [key in keyof T["properties"]]: Resolve<T["properties"][key]> }>
    : T extends { type: "dict" }
    ? { [key: string]: Resolve<T["valueSchema"]> }
    : T extends { type: "union" }
    ? Resolve<T["itemSchemas"][number]>
    : never,
  T["options"]
>;

type WithOptions<T extends any, O extends SchemaOptions> = O extends { optional: true; nullable: true }
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
  public static Number(): NumberSchema {
    return { type: "number", options: {}, definition: "number" };
  }

  public static Boolean(): BooleanSchema {
    return { type: "boolean", options: {}, definition: "boolean" };
  }

  public static String(): StringSchema {
    return { type: "string", options: {}, definition: "string" };
  }

  public static Enum<T extends string>(values: T[]): EnumSchema<T> {
    return { type: "enum", values, options: {}, definition: values.map((value) => `"${value}"`).join(" | ") };
  }

  public static Array<T extends AllSchema>(itemSchema: T): ArraySchema<T> {
    return { type: "array", itemSchema, options: {}, definition: `Array<${itemSchema.definition}>` };
  }

  public static Object<T extends ObjectProperties>(properties: T): ObjectSchema<T> {
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

  public static Optional<T extends AllSchema>(schema: T): OptionalSchema<T> {
    schema.options.optional = true;
    return schema as OptionalSchema<T>;
  }

  public static Nullable<T extends AllSchema>(schema: T): NullableSchema<T> {
    schema.options.nullable = true;
    schema.definition = `${schema.definition} | null`;
    return schema as NullableSchema<T>;
  }

  public static Union<T extends AllSchema>(schemas: T[]): UnionSchema<T> {
    const uniquified = (() => {
      const flattend = schemas
        .map((schema) => {
          if (schema.type === "union") {
            return schema.itemSchemas;
          }
          return schema;
        })
        .flat() as SchemaWithoutUnion<T>[];
      return Array.from(new Map(flattend.map((schema) => [JSON.stringify(schema.definition), schema]))).map(
        ([, schema]) => schema
      );
    })();

    return {
      type: "union",
      itemSchemas: uniquified,
      options: {},
      definition: uniquified.map((schema) => schema.definition).join(" | "),
    };
  }

  public static Dict<T extends AllSchema>(valueSchema: T): DictSchema<T> {
    return { type: "dict", valueSchema, options: {}, definition: `{ [key: string]: ${valueSchema.definition} }` };
  }
}
