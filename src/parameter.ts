import { AllType } from "./schema";

type QueryParameter<T extends AllType> = {
  type: "query";
  schema: T;
};

type PathParameter<T extends AllType> = {
  type: "path";
  schema: T;
};

type RequestBody<T extends AllType> = {
  type: "body";
  schema: T;
};

export type RequestParameter = QueryParameter<any> | PathParameter<any> | RequestBody<any>;

export class Parameter {
  public static Query<T extends AllType>(schema: T): QueryParameter<T> {
    return { type: "query", schema };
  }

  public static Path<T extends AllType>(schema: T): PathParameter<T> {
    return { type: "path", schema };
  }

  public static Body<T extends AllType>(schema: T): RequestBody<T> {
    return { type: "body", schema };
  }
}
