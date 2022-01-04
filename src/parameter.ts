import { AllSchema } from ".";

export type QueryParameter<T extends AllSchema> = {
  type: "query";
  schema: T;
};

export type PathParameter<T extends AllSchema> = {
  type: "path";
  schema: T;
};

export type RequestBody<T extends AllSchema> = {
  type: "body";
  schema: T;
};

export type RequestParameter = QueryParameter<any> | PathParameter<any> | RequestBody<any>;

export class Parameter {
  public static Query<T extends AllSchema>(schema: T): QueryParameter<T> {
    return { type: "query", schema };
  }

  public static Path<T extends AllSchema>(schema: T): PathParameter<T> {
    return { type: "path", schema };
  }

  public static Body<T extends AllSchema>(schema: T): RequestBody<T> {
    return { type: "body", schema };
  }
}
