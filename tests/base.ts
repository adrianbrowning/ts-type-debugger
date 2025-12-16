export const CustomTypes = `type tables = {
    User: {
        id: number;
        name: string;
    },
    Post: {
        id: number;
        title: string;
        deep: {
            foo: 'bar'
        }
    }
};

type getter<path extends string> = path extends validateLeafPath<tables, path>
        ? path
        : validateLeafPath<tables, path>

function get<path extends string>(
    pathStr: path extends validateLeafPath<tables, path>
        ? path
        : validateLeafPath<tables, path>
) {
    return pathStr;
}

/** Mimics the result of Object.keys(...) */
type keyOf<o> =
    o extends readonly unknown[] ?
        number extends o["length"] ?
            \`\${number}\`
        :   keyof o & \`\${number}\`
    :   {
            [k in keyof o]: k extends string ? k
            : k extends number ? \`\${k}\`
            : never
        }[keyof o]

type getKey<o, k> =
    k extends keyof o ? o[k]
    : k extends \`\${infer n extends number & keyof o}\` ? o[n]
    : never

// Check if a type is a leaf (no keys = primitive)
type isLeaf<T> =
    [keyof T] extends [never] ? true : false

// Recursively get only leaf paths (no intermediate objects)
type getLeafPaths<o, prefix extends string = ""> =
    {
        [k in keyOf<o>]:
            isLeaf<getKey<o, k>> extends true
                ? \`\${prefix}\${k}\` // This is a leaf path
                : getLeafPaths<getKey<o, k>, \`\${prefix}\${k}.\`> // Recurse deeper, skip this level
    }[keyOf<o>]

// Build suggestions showing next possible steps (including intermediate non-leaves for autocomplete)
type getSuggestions<o, currentPath extends string, prefix extends string = ""> =
    {
        [k in keyOf<o>]: \`\${prefix}\${currentPath}\${currentPath extends "" ? "" : "."}\${k}\`
    }[keyOf<o>]

// Validate path: if it's a leaf path, accept it; otherwise show suggestions
type validateLeafPath<o, path extends string, prefix extends string = ""> =
    path extends \`\${infer head}.\${infer tail}\`
        ? head extends keyOf<o>
            ? validateLeafPath<getKey<o, head>, tail, \`\${prefix}\${head}.\`>
            : getSuggestions<o, "", prefix>
        : path extends ""
            ? getSuggestions<o, "", prefix>
            : path extends keyOf<o>
                ? isLeaf<getKey<o, path>> extends true
                    ? path // Valid leaf path
                    : getSuggestions<getKey<o, path>, path, prefix> // Show next steps
                : getSuggestions<o, path, prefix> // Show partial match suggestions`;
