// Minimal path stub for browser
export const join = (...parts: Array<string>) => parts.join("/").replace(/\/+/g, "/");
export const dirname = (p: string) => p.split("/").slice(0, -1)
  .join("/") || "/";
export const basename = (p: string) => p.split("/").pop() || "";
export const resolve = (...parts: Array<string>) => join(...parts);
export const sep = "/";
export default { join, dirname, basename, resolve, sep };
