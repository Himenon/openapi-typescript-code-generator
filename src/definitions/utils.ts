export type MapLike<K extends string, T> = {
  [key in K]: T;
};
