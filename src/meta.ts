import pkgJson from "../package.json" with { type: "json" };
export const Name = pkgJson.name;
export const Version = pkgJson.version;
