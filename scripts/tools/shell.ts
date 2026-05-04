<<<<<<< HEAD
import { type ResultPromise, execa } from "execa";
=======
import { execa, type ResultPromise } from "execa";
>>>>>>> 7b64d04cab4a272c3f6e680fa294110083ae3879

export const shell = (command: string, cwd: string = process.cwd()): ResultPromise => {
  return execa(command, {
    stdio: ["pipe", "pipe", "inherit"],
    shell: true,
    cwd,
  });
};
