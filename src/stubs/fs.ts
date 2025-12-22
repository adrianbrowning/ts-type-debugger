// Empty stub for Node.js fs module - not used in browser
export default {};
export const readFileSync = () => { throw new Error("fs not available in browser"); };
export const existsSync = () => false;
export const readdirSync = () => [];
