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
