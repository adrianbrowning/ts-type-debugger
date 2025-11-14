import {createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment} from "@typescript/vfs";
import * as ts from "typescript";

async function checkTypeCondition(typeBody: string, checker: string, context?: string): Promise<boolean> {
    // 1. Set up a virtual fs map with lib files loaded from CDN (for type definitions)
    const fsMap = await createDefaultMapFromCDN(
        { target: ts.ScriptTarget.ESNext, lib: ["esnext", "dom"] },
        ts.version,
        true,
        ts,
    );

    // 2. Our virtual file with the type eval logic
    const fileName = "temp.ts";
    const code = `
    type path = ${typeBody};
    type _r = path extends ${checker} ? true : false;
    ${context ? context + ";": ""}
    declare const _result: _r;
  `;
    fsMap.set(fileName, code);

    // 3. Create a virtual TypeScript environment
    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(system, [fileName], ts, {});
     const typeChecker = env.languageService.getProgram()!.getTypeChecker();

  const sourceFile = env.languageService.getProgram()!.getSourceFile(fileName);
    let resultType: ts.Type | undefined;

    ts.forEachChild(sourceFile!, node => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isVariableDeclaration(decl) && decl.name.getText() === "_result") {
          resultType = typeChecker.getTypeAtLocation(decl);
        }
      }
        }
    });

    if (!resultType) throw new Error("Could not determine result type");
  return typeChecker.typeToString(resultType) === "true";
}

// Usage:
checkTypeCondition('""', '""').then(console.log);      // true
checkTypeCondition('"Foo"', '""').then(console.log);   // false
