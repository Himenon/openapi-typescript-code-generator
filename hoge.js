const path = require("path");

const entryFilename = path.join(__dirname, "index.yml");
const filename = path.join(__dirname, "my.yml");
const ref = "./components/hoge.yml";

// calculate

const basedir = path.dirname(filename);
const referenceFilename = path.join(basedir, ref);
const ext = path.extname(referenceFilename);
const relativePathFromEntryFile = path.relative(path.dirname(entryFilename), referenceFilename);

const names = relativePathFromEntryFile.replace(ext, "").split("/");

console.log({
  entryFilename,
  filename,
  ref,
  referenceFilename,
  relativePathFromEntryFile,
  ext,
  names,
});