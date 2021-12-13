type TypeOptions = {
  optional?: boolean;
};

type NumberType = {
  type: "number";
  options: TypeOptions;
};

type BooleanType = {
  type: "boolean";
  options: TypeOptions;
};

type StringType = {
  type: "string";
  options: TypeOptions;
};

type NullType = {
  type: "null";
  options: TypeOptions;
};

type EnumType = {
  type: "enum";
  values: string[];
  options: TypeOptions;
};

type ArrayType<T extends AllType> = {
  type: "array";
  itemType: T;
  options: TypeOptions;
};

type UnionType<T extends AllType> = {
  type: "union";
  itemTypes: T[];
  options: TypeOptions;
};

type ObjectProperties = { [key in string]: AllType };

type ObjectType<T extends ObjectProperties> = {
  type: "object";
  properties: T;
  options: TypeOptions;
};

type OptionalType<T extends AllType> = Omit<T, "options"> & { options: T["options"] & { optional: true } };

export type AllType =
  | NumberType
  | BooleanType
  | StringType
  | NullType
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

  public static Null(): NullType {
    return { type: "null", options: {} };
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

  public static Union<T extends AllType>(types: T[]): UnionType<T> {
    return { type: "union", itemTypes: types, options: {} };
  }
}
