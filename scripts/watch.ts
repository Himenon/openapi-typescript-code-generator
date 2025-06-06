import * as chokidar from "chokidar";

import { shell } from "./tools/shell.js";

process.on("unhandledRejection", reason => {
  console.log(reason);
});

const main = async () => {
  console.log((await shell("pnpm run build")).stdout);
  console.log((await shell("pnpm run test:code:gen")).stdout);

  chokidar.watch("./src", { ignored: ["src/meta.ts"] }).on("change", async path => {
    console.log(`Watch Change file ... ${path}`);
    try {
      console.log((await shell("pnpm build")).stdout);
      console.log((await shell("pnpm run test:code:gen")).stdout);
    } catch (error) {
      console.error("Failed");
    }
  });

  chokidar.watch("./test", { ignored: [/code/] }).on("change", async path => {
    console.log(`Watch Change file ... ${path}`);
    try {
      console.log((await shell("pnpm run test:code:gen")).stdout);
    } catch (error) {
      console.error("Failed");
    }
  });
};
main().catch(error => {
  console.error(error);
  process.exit(1);
});
