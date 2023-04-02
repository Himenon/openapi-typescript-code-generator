import { Encoding, MediaType } from "../../../typedef/OpenApi";

type EncodingMap = Record<string, Encoding>;

export const createEncodingMap = (content: Record<string, MediaType>): EncodingMap => {
  return Object.keys(content).reduce<EncodingMap>((all, key) => {
    const { encoding } = content[key];
    if (!encoding) {
      return all;
    }
    return { ...all, [key]: encoding };
  }, {});
};
