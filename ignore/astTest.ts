import ts from 'typescript';
import { generateAST, printAST, findNodes, visitNodes } from './astGenerator.ts';

// Test 1: Basic parsing
console.log('=== Test 1: Basic Code Parsing ===\n');
const code1 = `
  const x: number = 42;
  const message = "Hello";
`;
const ast1 = generateAST(code1);
console.log(printAST(ast1, 5));

// Test 2: Complex type annotations
console.log('\n\n=== Test 2: Complex Types ===\n');
const code2 = `
  type Result<T> = T extends Promise<infer U> ? U : T;

  interface Config {
    debug?: boolean;
    timeout: number;
  }

  class Logger {
    constructor(config: Config) {}
    log(msg: string): void {}
  }
`;
const ast2 = generateAST(code2);
console.log(printAST(ast2));

// Test 3: Find specific node types
console.log('\n\n=== Test 3: Node Queries ===\n');
const classDecls = findNodes(ast2, ts.SyntaxKind.ClassDeclaration);
console.log(`Found ${classDecls.length} class(es)`);
classDecls.forEach((c) => {
  console.log(`- ${(c as ts.ClassDeclaration).name?.text}`);
});

const typeAliases = findNodes(ast2, ts.SyntaxKind.TypeAliasDeclaration);
console.log(`Found ${typeAliases.length} type alias(es)`);
typeAliases.forEach((t) => {
  console.log(`- ${(t as ts.TypeAliasDeclaration).name?.text}`);
});

// Test 4: Generic visitor
console.log('\n\n=== Test 4: Custom Visitor ===\n');
let varCount = 0;
visitNodes(ast1, (node) => {
  if (node.kind === ts.SyntaxKind.VariableDeclaration) {
    varCount++;
    const varDecl = node as ts.VariableDeclaration;
    console.log(`Variable: ${varDecl.name?.getText(ast1)}`);
  }
});
console.log(`Total variables: ${varCount}`);

// Test 5: Arrow functions & params
console.log('\n\n=== Test 5: Function Analysis ===\n');
const code5 = `
  const add = (a: number, b: number): number => a + b;
  function multiply(x: number, y: number) { return x * y; }
`;
const ast5 = generateAST(code5);
const functions = findNodes(ast5, ts.SyntaxKind.FunctionDeclaration);
const arrows = findNodes(ast5, ts.SyntaxKind.ArrowFunction);

console.log(`Function declarations: ${functions.length}`);
console.log(`Arrow functions: ${arrows.length}`);

console.log('\n✅ All tests completed!');
