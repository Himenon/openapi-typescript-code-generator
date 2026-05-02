import { type ResultPromise, execa } from "execa";

export const shell = (command: string, cwd: string = process.cwd()): ResultPromise => {
  return execa(command, {
    stdio: ["pipe", "pipe", "inherit"],
    shell: true,
    cwd,
  });
};
