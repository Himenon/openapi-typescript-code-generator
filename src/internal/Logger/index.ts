export const info = (message: string): void => {
  console.info(message);
};

export const showFilePosition = (entryPoint: string, currentPoint: string, referencePoint?: string): void => {
  console.log("");
  console.log("FilePointInfo");
  console.log(`- EntryPoint     : ${entryPoint}`);
  console.log(`- CurrentPoint   : ${currentPoint}`);
  referencePoint && console.log(`- ReferencePoint : ${referencePoint}`);
  console.log("");
};

export const error = (message: string): void => {
  console.error(message);
};

export const warn = (message: string): void => {
  console.log(message);
};
