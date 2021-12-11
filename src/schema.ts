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

type AllType = NumberType | BooleanType | StringType | ArrayType<any> | ObjectType<any> | UnionType<any>;

class Schema {
  public Number(): NumberType {
    return { type: "number", options: {} };
  }

  public Boolean(): BooleanType {
    return { type: "boolean", options: {} };
  }

  public String(): StringType {
    return { type: "string", options: {} };
  }

  public Array<T extends AllType>(itemType: T): ArrayType<T> {
    return { type: "array", itemType, options: {} };
  }

  public Object<T extends ObjectProperties>(properties: T): ObjectType<T> {
    return { type: "object", properties, options: {} };
  }

  public Optional<T extends AllType>(type: T): OptionalType<T> {
    type.options.optional = true;
    return type as OptionalType<T>;
  }

  public Union<T extends AllType>(types: T[]): UnionType<T> {
    return { type: "union", itemTypes: types, options: {} };
  }
}
