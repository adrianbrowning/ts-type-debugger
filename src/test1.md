expression: getter<"">
type: generic_call
args: { path: '""' }
level: 1


expression: path extends validateLeafPath<tables, path> ? path : validateLeafPath<tables, path>
type: alias
parameters: { path: '""' }
level: 2


expression: path extends validateLeafPath<tables, path>
type: condition
parameters: { path: '""' }
level: 2


expression: validateLeafPath<tables, path>
type: generic_call
args: { tables: /*from the customTypes*/, path: '""' }
level: 2


expression:   `path extends \`\${infer head}.\${infer tail}\`
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
type: alias
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3


expression:   `path extends \`\${infer head}.\${infer tail}\`
type: condition
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression:   `\${infer head}.\${infer tail}\`
type: literal
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression:   `""" extends \`\${infer head}.\${infer tail}\`
type: substitution
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression:   `false`
type: result
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `path extends ""
? getSuggestions<o, "", prefix>
: path extends keyOf<o>
? isLeaf<getKey<o, path>> extends true
? path // Valid leaf path
: getSuggestions<getKey<o, path>, path, prefix> // Show next steps
: getSuggestions<o, path, prefix> // Show partial match suggestions`;
result: path extends ""
type: condition
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `path extends ""`
result: `"" extends ""`
type: substitution
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `"" extends ""`
result: `true`
type: condition
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `getSuggestions<o, "", prefix>`
result: `branch_true`
type: condition
parameters: { o: tables, path: '""', prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `getSuggestions<o, "", prefix>`
result: `generic_call`
type: generic_call
args: { o: tables, prefix : "" /*using default value as not passed in*/ }
level: 3

expression: `{
        [k in keyOf<o>]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }[keyOf<o>]`
type: alias
map_result = {}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k in keyOf<o>]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }[keyOf<o>]`
type: mapped
map_result = {}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k in keyOf<o>]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
type: mapped
map_result = {}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `k in keyOf<o>`
type: mapped_key
map_result = {}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `k in "User" | "Post"`
type: substitution
map_result = {}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k in "User" | "Post"]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
type: mapped_loop
map_result = {}
locals: {k: "User" | "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
type: mapped_key_union_loop_1
map_result = {}
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${currentPath}${currentPath extends "" ? "" : "."}${k}`
type: substitution
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${currentPath}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
type: substitution
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
result: `currentPath extends "" ? "" : "."`
type: substitution_conditional
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `currentPath extends ""`
result: `true`
type: conditional
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `true`
result: `"""`
type: branch_true
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `currentPath extends "" ? "" : "."`
result: `"""`
type: branch_result
result: {}
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${""}${""}${k}`
type: substitution
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${""}${k}`
result: `${""}${""}${""}${"User"}`
type: substitution
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${""}${"User"}`
expression: `"User"`
type: literal_eval
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
expression: `{"User": "User"}`
map_result = {"User": "User"}
type: substitution_result
locals: {k: "User"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4


expression: `{
        [k]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
type: mapped_key_union_loop_2
map_result = {}
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${currentPath}${currentPath extends "" ? "" : "."}${k}`
type: substitution
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${currentPath}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
type: substitution
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
result: `currentPath extends "" ? "" : "."`
type: substitution_conditional
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `currentPath extends ""`
result: `true`
type: conditional
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `true`
result: `"""`
type: branch_true
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `currentPath extends "" ? "" : "."`
result: `"""`
type: branch_result
result: {}
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${currentPath extends "" ? "" : "."}${k}`
result: `${""}${""}${""}${k}`
type: substitution
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${""}${k}`
result: `${""}${""}${""}${"Post"}`
type: substitution
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `${""}${""}${""}${"Post"}`
expression: `"Post"`
type: literal_eval
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{
        [k]: `${prefix}${currentPath}${currentPath extends "" ? "" : "."}${k}`
    }`
expression: `{"Post": "Post"}`
map_result = {"User": "User"} & {"Post": "Post"}
type: substitution_result
locals: {k: "Post"}
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: {"User": "User"} & {"Post": "Post"}
result: `{"User": "User", "Post": "Post"}`
type: mapped_join
parameters: { o: o, currentPath: "", prefix : "" || "" /*using default value as not passed in*/ }
level: 4

expression: `{"User": "User", "Post": "Post"}[keyof<o>]`
result: {"User": "User", "Post": "Post"}
type: indexed_map
level: 4

expression: `keyof<o>`
result: "User" | "Post"
type: indexed_map_substitution
level: 4

expression: `{"User": "User", "Post": "Post"}["User" | "Post"]`
result: "User" | "Post"
type: indexed_map
level: 4

expression: `getSuggestions`
result: "User" | "Post"
type: generic_result
level: 4

expression: `validateLeafPath`
result: "User" | "Post"
type: generic_result
level: 3

expression: `getter`
result: "User" | "Post"
type: generic_result
level: 2

expression: `getter`
result: "User" | "Post"
type: generic_result
level: 1
