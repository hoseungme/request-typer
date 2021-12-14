import { AllType } from "./schema";

export class Validator {
  public static validate(schema: AllType, value: any): boolean {
    if (value === undefined) {
      return !!schema.options.optional;
    }

    switch (schema.type) {
      case "number": {
        return typeof value === "number";
      }
      case "string": {
        return typeof value === "string";
      }
      case "boolean": {
        return typeof value === "boolean";
      }
      case "null": {
        return value === null;
      }
      case "enum": {
        return schema.values.some((v) => v === value);
      }
      case "array": {
        const isArray = value instanceof Array;
        if (!isArray) {
          return false;
        }
        return value.every((item) => this.validate(schema.itemType, item));
      }
      case "union": {
        return schema.itemTypes.some((item) => this.validate(item, value));
      }
      case "object": {
        const isObject = typeof value === "object" && value !== null && !(value instanceof Array);
        if (!isObject) {
          return false;
        }
        const keys = Object.keys(schema.properties);
        return keys.every((key) => {
          return this.validate(schema.properties[key], value[key]);
        });
      }
    }
  }
}
