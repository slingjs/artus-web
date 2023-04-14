export type PropertyType<T, Path extends string> = string extends Path // Not any, string type ( Not means String instance ).
  ? unknown
  : Path extends keyof T
    ? T[Path]
    : Path extends `${ infer K }.${ infer R }`
      ? K extends keyof T
        ? PropertyType<T[K], R>
        : unknown
      : unknown;

export type MultiPropertyType<K, T extends string> = {
  [P in T]: PropertyType<K, P>;
}

export type DeepestKeys<T> = T extends string ? never : {
  [K in keyof T & string]: T[K] extends string ? K : DeepestKeys<T[K]>;
}[keyof T & string];

export type DeepestPaths<T, Path extends string[] = []> = T extends string ? Path : {
  [K in keyof T & string]: DeepestPaths<T[K], [...Path, K]>;
}[keyof T & string];

export type ExcludePath<T, Key extends string, Path extends string[] = []> = T extends string ? Path : {
  [K in keyof T & string]: K extends Key
    ? T[K] extends string ? never : ExcludePath<T[K], Key, [...Path, K]>
    : ExcludePath<T[K], Key, [...Path, K]>;
}[keyof T & string];

export type PathTo<T, Key extends string> = Exclude<DeepestPaths<T>, ExcludePath<T, Key>> extends [...infer Path, infer _]
  ? Path
  : never;

export type GetKeyPaths<T> = { [K in DeepestKeys<T>]: PathTo<T, K>; };

export type NestedKeyOf<ObjectType extends object> =
  {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${ Key }` | `${ Key }.${ NestedKeyOf<ObjectType[Key]> }`
    : `${ Key }`
  }[keyof ObjectType & (string | number)];
