import ts from 'typescript';
import {
  generateAST,
  getNodeByName,
  getTypeAliases,
  getTypeAliasByName,
  getTypeAliasType,
  isConditionalType,
  parseConditionalType,
  printAST,
} from './astGenerator.ts';

// Test 1: Get node by name
console.log('=== Test 1: Get Node by Name ===\n');
const code1 = `
  type Result = string;
  interface User {
    id: number;
  }
  function process() {}
  const config = { debug: true };
`;
const ast1 = generateAST(code1);

const resultNode = getNodeByName(ast1, 'Result');
console.log(`Found "Result":`, resultNode?.kind === ts.SyntaxKind.TypeAliasDeclaration ? 'TypeAlias ✓' : 'Not found');

const userNode = getNodeByName(ast1, 'User');
console.log(`Found "User":`, userNode?.kind === ts.SyntaxKind.InterfaceDeclaration ? 'Interface ✓' : 'Not found');

const processNode = getNodeByName(ast1, 'process');
console.log(`Found "process":`, processNode?.kind === ts.SyntaxKind.FunctionDeclaration ? 'Function ✓' : 'Not found');

const notFound = getNodeByName(ast1, 'NonExistent');
console.log(`Found "NonExistent":`, notFound ? 'Found' : 'Not found ✓');

// Test 2: Get TypeAliases
console.log('\n=== Test 2: Get All Type Aliases ===\n');
const code2 = `
  type ID = string | number;
  type Name = string;
  interface Config {}
  type Response<T> = { data: T; error?: string };
`;
const ast2 = generateAST(code2);
const aliases = getTypeAliases(ast2);
console.log(`Found ${aliases.length} type aliases:`);
aliases.forEach((alias) => {
  console.log(`- ${alias.name.text}`);
});

// Test 3: Get TypeAliasByName
console.log('\n=== Test 3: Get Type Alias by Name ===\n');
const responseAlias = getTypeAliasByName(ast2, 'Response');
if (responseAlias) {
  const typeStr = getTypeAliasType(responseAlias, ast2);
  console.log(`Response type: ${typeStr}`);
}

const idAlias = getTypeAliasByName(ast2, 'ID');
if (idAlias) {
  const typeStr = getTypeAliasType(idAlias, ast2);
  console.log(`ID type: ${typeStr}`);
}

// Test 4: Conditional Types
console.log('\n=== Test 4: Navigate Conditional Types ===\n');
const code4 = `
  type IsString<T> = T extends string ? true : false;
  type Flatten<T> = T extends Array<infer U> ? U : T;
  type GetReturn<T> = T extends (...args: any[]) => infer R ? R : never;
`;
const ast4 = generateAST(code4);
const conditionalAliases = getTypeAliases(ast4);

conditionalAliases.forEach((alias) => {
  if (isConditionalType(alias.type)) {
    const parts = parseConditionalType(alias.type, ast4);
    console.log(`\n${alias.name.text}:`);
    console.log(`  check: ${parts.check}`);
    console.log(`  extends: ${parts.extendsType}`);
    console.log(`  true: ${parts.trueType}`);
    console.log(`  false: ${parts.falseType}`);
  }
});

// Test 5: Complex nested type navigation
console.log('\n=== Test 5: Navigate Complex Types ===\n');
const code5 = `
  type Getter<P extends string> = P extends \`\${infer K}.\${infer Rest}\`
    ? { [k in K]: Getter<Rest> }
    : { value: string };
`;
const ast5 = generateAST(code5);
const getterAlias = getTypeAliasByName(ast5, 'Getter');
if (getterAlias) {
  console.log(`Found Getter type alias`);
  const typeStr = getTypeAliasType(getterAlias, ast5);
  console.log(`Type: ${typeStr}`);

  if (isConditionalType(getterAlias.type)) {
    const parts = parseConditionalType(getterAlias.type, ast5);
    console.log(`Is conditional type: yes`);
    console.log(`  check: ${parts.check}`);
  }
}

console.log('\n✅ All navigation tests completed!');
