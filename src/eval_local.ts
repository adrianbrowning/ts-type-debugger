import { createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import * as ts from "typescript";
import {libFiles} from "./services/typescript/lib-bundle.ts"


function loadLibs() {
    return new Map<string, string>(Object.entries(libFiles));
}

export function checkTypeCondition(typeBody: string, checker: string, context?: string): boolean {
    const fsMap = loadLibs();

    const fileName = "temp.ts";
    const code = `
    type path = ${typeBody};
    type _r = path extends ${checker} ? true : false;
    ${context ? context + ";" : ""}
    declare const _result: _r;
  `;
    fsMap.set(fileName, code);

    // 4. Create system and virtual env
    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(
        system,
        [fileName],
        ts,
        { rootDir: "/", target: ts.ScriptTarget.ESNext, lib: ["esnext", "dom"] }
    );

    const typeChecker = env.languageService.getProgram()!.getTypeChecker();
    const sourceFile = env.languageService.getProgram()!.getSourceFile(fileName);

    // 5. Find type of _result and compare — same as before
    let resultType: ts.Type | undefined;

    ts.forEachChild(sourceFile!, node => {
        if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
                if (
                    ts.isVariableDeclaration(decl) &&
                    decl.name.getText() === "_result"
                ) {
                    resultType = typeChecker.getTypeAtLocation(decl);
                }
            }
        }
    });

    if (!resultType) throw new Error("Could not determine result type");
    return typeChecker.typeToString(resultType) === "true";
}

export function evalTypeString(context: string, expr: string): string {
    const fsMap = loadLibs();

    const fileName = "/main.ts";
    fsMap.set(fileName, `${context}\ntype _Eval = ${expr};`);
    const system = createSystem(fsMap);
    const env = createVirtualTypeScriptEnvironment(system, [fileName], ts, {
        rootDir: "/",
        target: ts.ScriptTarget.ESNext,
    });
    const checker = env.languageService.getProgram()!.getTypeChecker();
    const source = env.languageService.getProgram()!.getSourceFile(fileName)!;

    // Find the _Eval type alias node
    let node: ts.TypeAliasDeclaration | undefined;
    ts.forEachChild(source, child => {
        if (
            ts.isTypeAliasDeclaration(child) &&
            child.name.escapedText === "_Eval"
        ) node = child;
    });
    if (!node) throw new Error("_Eval not found");

    // Get the type
    const type = checker.getTypeAtLocation(node);

    // Helper: expand union of string literals into "A" | "B"
    function typeString(type: ts.Type): string {
        if (type.isUnion()) {
            const parts = (type as ts.UnionType).types;
            if (parts.every(t => t.isStringLiteral())) {
                return parts.map(t => JSON.stringify(t.value)).join(" | ");
            }
        }
        if (type.isStringLiteral()) return JSON.stringify(type.value);
        return checker.typeToString(type);
    }

    return typeString(type);
}
