import { AllSchema } from "./schema";

export class ValidationError {
  constructor(public readonly description: string) {}
}

interface SuccessResult {
  success: true;
}

interface FailedResult {
  success: false;
  error: ValidationError;
}

export type ValidationResult = SuccessResult | FailedResult;

export class Validator {
  public static validate(schema: AllSchema, value: any): ValidationResult {
    if (value === undefined) {
      return !!schema.options.optional ? this.makeResult(true) : this.makeResult(false, "should be provided");
    }

    switch (schema.type) {
      case "number": {
        return typeof value === "number"
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
      case "string": {
        return typeof value === "string"
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
      case "boolean": {
        return typeof value === "boolean"
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
      case "enum": {
        return schema.values.some((v) => v === value)
          ? this.makeResult(true)
          : this.makeResult(false, `should be one of ${schema.definition}`);
      }
      case "array": {
        const isArray = value instanceof Array;
        if (!isArray) {
          return this.makeResult(false, "should be array");
        }
        return value.every((item) => this.validate(schema.itemSchema, item).success)
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
      case "union": {
        return schema.itemSchemas.some((item) => this.validate(item, value).success)
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
      case "object": {
        const isObject = typeof value === "object" && value !== null && !(value instanceof Array);
        if (!isObject) {
          return this.makeResult(false, "should be object");
        }

        const failedResults = Object.keys(schema.properties)
          .map((key) => [key, this.validate(schema.properties[key], value[key])] as const)
          .filter((result) => !result[1].success) as (readonly [string, FailedResult])[];
        return failedResults.length === 0
          ? this.makeResult(true)
          : this.makeResult(
              false,
              failedResults.map((pair) => `property [${pair[0]}]: ${pair[1].error.description}`).join(", ")
            );
      }
      case "dict": {
        const isObject = typeof value === "object" && value !== null && !(value instanceof Array);
        if (!isObject) {
          return this.makeResult(false, "should be object");
        }

        return Object.keys(value).every((key) => this.validate(schema.valueSchema, value[key]).success)
          ? this.makeResult(true)
          : this.makeResult(false, `should be ${schema.definition}`);
      }
    }
  }

  private static makeResult(success: true): ValidationResult;
  private static makeResult(success: false, description: string): ValidationResult;
  private static makeResult(success: boolean, description?: string): ValidationResult {
    return success ? { success: true } : { success: false, error: new ValidationError(description!) };
  }
}
