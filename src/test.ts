import {CustomTypes} from "../tests/base.ts";
// import {buildTrace} from "./buildTrace.ts";
import {generateAST, traceTypeResolution} from "./astGenerator.ts";
import {generateTypeVideo} from "./core/typeDebugger.ts";


// Type is defined by implementation - keeping this for reference
// declare function buildTrace(expression: string, options: { customTypes: string }): Promise<{ trace: Array<Record<string, {
//     step: number;
//     level: number;
//     type: "condition" | "generic_call" | "substitution" | "union_loop" | "map_loop" | ({} & string) /*any others*/;
//     position: { /* REGION: We can change this definition */
//         line: [ start: number, end: number];
//         column: [ start: number, end: number];
//     };/*REGION: END*/
//     }>>; finalResult: string; }>;

//AST Test
{

    const data = await generateTypeVideo("type T<t extends string> = t;", "`${'a' | 'b'} - ${1 | 2} - ${T<\"c\" | \"d\">}`")
    console.dir(data, {depth: null});
    process.exit(0);
}


//Test 1
{


    const expression = `getter<"">`;
    const result = buildTrace(expression, {
        customTypes: CustomTypes
    });
    console.log(JSON.stringify(result, null,2));
}

//Test 2
{
    const expression = `getter<"Post">`;
    const result = buildTrace(expression, {
        customTypes: CustomTypes
    });
    console.log(result);
}

//Test 3
{
    const expression = `getter<"Post.deep">`;
    const result = buildTrace(expression, {
        customTypes: CustomTypes
    });
    console.log(result);
}

//Test 4
{
    const expression = `getter<"Post.deep.foo">`;
    const result = buildTrace(expression, {
        customTypes: CustomTypes
    });
    console.log(result);
}

//Test 4
{
    const expression = `getter<"User.id">`;
    const result = buildTrace(expression, {
        customTypes: CustomTypes
    });
    console.log(result);
}


export {};

    function buildTrace(expression: string, options?: { customTypes: string }) {
        const cleanExpression = expression.trim().replace(/;+$/, '').trim();
        const ast = generateAST(`type _result = ${cleanExpression};\n` + options?.customTypes || "");

        return traceTypeResolution(ast, '_result');
    }
