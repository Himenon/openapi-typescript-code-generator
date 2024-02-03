import * as rimraf from "rimraf";

const main = async () => {
  rimraf.sync("lib");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
