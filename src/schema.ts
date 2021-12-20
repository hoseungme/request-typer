export interface SchemaOptions {
  optional?: boolean;
  nullable?: boolean;
}

export interface Schema {
  type: unknown;
  options: SchemaOptions;
  definition: string;
}

export interface NumberSchema extends Schema {
  type: "number";
}

export interface BooleanSchema extends Schema {
  type: "boolean";
}

export interface StringSchema extends Schema {
  type: "string";
}

export type EnumSchemaValue<T extends number | string> = { type: "number" | "string"; value: T };

export interface EnumSchema<T extends EnumSchemaValue<any>> extends Schema {
  type: "enum";
  keys: T[];
}

export interface ArraySchema<T extends AllSchema> extends Schema {
  type: "array";
  itemSchema: T;
}

export type SchemaWithoutUnion<T extends AllSchema> = T extends UnionSchema<any> ? T["itemSchemas"][number] : T;

export interface UnionSchema<T extends AllSchema> extends Schema {
  type: "union";
  itemSchemas: SchemaWithoutUnion<T>[];
}

export interface ObjectProperties {
  [key: string]: AllSchema;
}

export interface ObjectSchema<T extends ObjectProperties> extends Schema {
  type: "object";
  properties: T;
}

export interface DictSchema<T extends AllSchema> extends Schema {
  type: "dict";
  valueSchema: T;
}

export type OptionalSchema<T extends AllSchema> = Omit<T, "options"> & { options: T["options"] & { optional: true } };

export type NullableSchema<T extends AllSchema> = Omit<T, "options"> & { options: T["options"] & { nullable: true } };

export type AllSchema =
  | NumberSchema
  | StringSchema
  | BooleanSchema
  | EnumSchema<EnumSchemaValue<any>>
  | ArraySchema<AllSchema>
  | ObjectSchema<ObjectProperties>
  | UnionSchema<SchemaWithoutUnion<any>>
  | DictSchema<AllSchema>;

export type Resolve<T extends Schema> = WithOptions<
  T extends NumberSchema
    ? number
    : T extends StringSchema
    ? string
    : T extends BooleanSchema
    ? boolean
    : T extends EnumSchema<EnumSchemaValue<any>>
    ? T["keys"][number]["value"]
    : T extends ArraySchema<AllSchema>
    ? Resolve<T["itemSchema"]>[]
    : T extends ObjectSchema<ObjectProperties>
    ? UndefinedPropertyToOptional<{ [key in keyof T["properties"]]: Resolve<T["properties"][key]> }>
    : T extends UnionSchema<AllSchema>
    ? Resolve<T["itemSchemas"][number]>
    : T extends DictSchema<AllSchema>
    ? { [key: string]: Resolve<T["valueSchema"]> }
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

export type UndefinedPropertyToOptional<T extends Record<string, any>> = Omit<T, KeyOfUndefinedProperty<T>> &
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

  public static Enum<T extends number | string>(values: T[]): EnumSchema<EnumSchemaValue<T>> {
    return {
      type: "enum",
      keys: values.map((value) => ({
        type: typeof value === "number" ? "number" : "string",
        value,
      })),
      options: {},
      definition: values.map((value) => `${typeof value === "number" ? value.toString() : `"${value}"`}`).join(" | "),
    };
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
