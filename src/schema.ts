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

export type EnumValue = number | string;

export type EnumSchemaKey<T extends EnumValue> = { type: "number" | "string"; value: T };

export interface EnumSchema<T extends EnumSchemaKey<any>> extends Schema {
  type: "enum";
  keys: T[];
}

export interface ArraySchema<T extends Schema> extends Schema {
  type: "array";
  itemSchema: T;
}

export type SchemaWithoutUnion<T extends Schema> = T extends UnionSchema<infer U> ? U : T;

export interface UnionSchema<T extends Schema> extends Schema {
  type: "union";
  itemSchemas: SchemaWithoutUnion<T>[];
}

export type ObjectProperties = Record<string, Schema>;

export interface ObjectSchema<T extends ObjectProperties> extends Schema {
  type: "object";
  properties: T;
}

export interface DictSchema<T extends Schema> extends Schema {
  type: "dict";
  valueSchema: T;
}

export type OptionalSchema<T extends Schema> = Omit<T, "options"> & { options: T["options"] & { optional: true } };

export type NullableSchema<T extends Schema> = Omit<T, "options"> & { options: T["options"] & { nullable: true } };

export type AllSchema =
  | NumberSchema
  | StringSchema
  | BooleanSchema
  | EnumSchema<EnumSchemaKey<any>>
  | ArraySchema<AllSchema>
  | ObjectSchema<Record<string, any>>
  | UnionSchema<AllSchema>
  | DictSchema<AllSchema>;

export type RequiredPropertyKeys<T extends ObjectProperties> = keyof Omit<T, OptionalPropertyKeys<T>>;
export type OptionalPropertyKeys<T extends ObjectProperties> = {
  [key in keyof T]: T[key]["options"]["optional"] extends true ? key : never;
}[keyof T];

export type Resolve<T extends Schema> = T extends OptionalSchema<infer U>
  ? Resolve<U> | undefined
  : T extends NullableSchema<infer U>
  ? Resolve<U> | null
  : T extends NumberSchema
  ? number
  : T extends StringSchema
  ? string
  : T extends BooleanSchema
  ? boolean
  : T extends EnumSchema<EnumSchemaKey<infer U>>
  ? U
  : T extends ArraySchema<infer U>
  ? Resolve<U>[]
  : T extends ObjectSchema<infer U>
  ? { [key in RequiredPropertyKeys<U>]: Resolve<U[key]> } & { [key in OptionalPropertyKeys<U>]?: Resolve<U[key]> }
  : T extends UnionSchema<infer U>
  ? Resolve<U>
  : T extends DictSchema<infer U>
  ? { [key: string]: Resolve<U> }
  : never;

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

  public static Enum<T extends EnumValue>(values: T[]): EnumSchema<EnumSchemaKey<T>> {
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
