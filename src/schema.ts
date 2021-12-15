export type TypeOptions = {
  optional?: boolean;
  nullable?: boolean;
};

export type NumberType = {
  type: "number";
  options: TypeOptions;
};

export type BooleanType = {
  type: "boolean";
  options: TypeOptions;
};

export type StringType = {
  type: "string";
  options: TypeOptions;
};

export type EnumType = {
  type: "enum";
  values: string[];
  options: TypeOptions;
};

export type ArrayType<T extends AllType> = {
  type: "array";
  itemType: T;
  options: TypeOptions;
};

export type UnionType<T extends AllType> = {
  type: "union";
  itemTypes: T[];
  options: TypeOptions;
};

export type ObjectProperties = { [key in string]: AllType };

export type ObjectType<T extends ObjectProperties> = {
  type: "object";
  properties: T;
  options: TypeOptions;
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
    return { type: "number", options: {} };
  }

  public static Boolean(): BooleanType {
    return { type: "boolean", options: {} };
  }

  public static String(): StringType {
    return { type: "string", options: {} };
  }

  public static Enum(values: string[]): EnumType {
    return { type: "enum", values, options: {} };
  }

  public static Array<T extends AllType>(itemType: T): ArrayType<T> {
    return { type: "array", itemType, options: {} };
  }

  public static Object<T extends ObjectProperties>(properties: T): ObjectType<T> {
    return { type: "object", properties, options: {} };
  }

  public static Optional<T extends AllType>(type: T): OptionalType<T> {
    type.options.optional = true;
    return type as OptionalType<T>;
  }

  public static Nullable<T extends AllType>(type: T): NullableType<T> {
    type.options.nullable = true;
    return type as NullableType<T>;
  }

  public static Union<T extends AllType>(types: T[]): UnionType<T> {
    return { type: "union", itemTypes: types, options: {} };
  }
}
