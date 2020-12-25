export const showFilePosition = (entryPoint: string, currentPoint: string): void => {
  console.log(`EntryPoint   : ${entryPoint}`);
  console.log(`CurrentPoint : ${currentPoint}`);
};

export const error = (message: string): void => {
  console.error(message);
};
