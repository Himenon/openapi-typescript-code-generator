export const isObject = (value: any): value is Record<string, any> => {
  return !!value && value !== null && !Array.isArray(value) && typeof value === "object";
};

export const isArray = (value: any): value is any[] => {
  return !!value && Array.isArray(value);
};
