export interface Logger {
  /**
   * default: undefined (all logs)
   * Number of lines displayed in the latest log
   */
  displayLogLines?: number;
}
export interface Option {
  logger?: Logger;
}
