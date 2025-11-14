// Parse type definitions into an evaluatable IR

export interface TypeNode {
  kind: string;
  text: string;
}

export interface GenericType extends TypeNode {
  kind: 'generic';
  name: string;
  typeArgs: TypeNode[];
}

export interface ConditionalType extends TypeNode {
  kind: 'conditional';
  check: TypeNode;
  extends: TypeNode;
  trueType: TypeNode;
  falseType: TypeNode;
}

export interface MappedType extends TypeNode {
  kind: 'mapped';
  key: string;
  keyConstraint: TypeNode;
  valueType: TypeNode;
  readonly?: boolean;
  optional?: boolean;
}

export interface TemplateLiteralType extends TypeNode {
  kind: 'template_literal';
  parts: (string | TypeNode)[];
}

export interface UnionType extends TypeNode {
  kind: 'union';
  members: TypeNode[];
}

export interface IntersectionType extends TypeNode {
  kind: 'intersection';
  members: TypeNode[];
}

export interface ObjectType extends TypeNode {
  kind: 'object';
  properties: Record<string, TypeNode>;
}

export interface StringLiteralType extends TypeNode {
  kind: 'string_literal';
  value: string;
}

export interface NumberLiteralType extends TypeNode {
  kind: 'number_literal';
  value: number;
}

export interface TypeReference extends TypeNode {
  kind: 'type_ref';
  name: string;
}

export interface IndexAccessType extends TypeNode {
  kind: 'index_access';
  object: TypeNode;
  index: TypeNode;
}

export interface TypeOperator extends TypeNode {
  kind: 'type_operator';
  operator: 'keyof' | 'typeof' | 'readonly' | 'infer';
  operand: TypeNode;
}

export interface ArrayType extends TypeNode {
  kind: 'array';
  elementType: TypeNode;
  readonly?: boolean;
}

export interface InferType extends TypeNode {
  kind: 'infer';
  name: string;
  constraint?: TypeNode;
}

export type AnyType =
  | GenericType
  | ConditionalType
  | MappedType
  | TemplateLiteralType
  | UnionType
  | IntersectionType
  | ObjectType
  | StringLiteralType
  | NumberLiteralType
  | TypeReference
  | IndexAccessType
  | TypeOperator
  | ArrayType
  | InferType
  | TypeNode;

// Tokenizer
interface Token {
  type: string;
  value: string;
  pos: number;
}

class TypeTokenizer {
  private input: string;
  private pos = 0;

  constructor(input: string) {
    this.input = input;
  }

  private peek(offset = 0): string {
    return this.input[this.pos + offset] || '';
  }

  private advance(): string {
    return this.input[this.pos++] || '';
  }

  private skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.advance();
    }
  }

  private skipComments() {
    while (true) {
      if (this.peek() === '/' && this.peek(1) === '/') {
        while (this.peek() && this.peek() !== '\n') {
          this.advance();
        }
        this.advance(); // skip newline
        this.skipWhitespace();
      } else if (this.peek() === '/' && this.peek(1) === '*') {
        this.advance(); // skip /
        this.advance(); // skip *
        while (!(this.peek() === '*' && this.peek(1) === '/')) {
          this.advance();
        }
        this.advance(); // skip *
        this.advance(); // skip /
        this.skipWhitespace();
      } else {
        break;
      }
    }
  }

  nextToken(): Token | null {
    this.skipWhitespace();
    this.skipComments();
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return null;
    }

    const startPos = this.pos;
    const ch = this.peek();

    // Keywords and identifiers
    if (/[a-zA-Z_$]/.test(ch)) {
      while (/[a-zA-Z0-9_$]/.test(this.peek())) {
        this.advance();
      }
      const value = this.input.substring(startPos, this.pos);
      return { type: 'ident', value, pos: startPos };
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      while (/[0-9]/.test(this.peek())) {
        this.advance();
      }
      const value = this.input.substring(startPos, this.pos);
      return { type: 'number', value, pos: startPos };
    }

    // String literals
    if (ch === '"' || ch === "'") {
      const quote = ch;
      this.advance();
      let value = '';
      while (this.peek() && this.peek() !== quote) {
        if (this.peek() === '\\') {
          this.advance();
        }
        value += this.advance();
      }
      this.advance(); // closing quote
      return { type: 'string_literal', value, pos: startPos };
    }

    // Template literals
    if (ch === '`') {
      this.advance();
      let value = '';
      let hasInterpolation = false;
      while (this.peek() && this.peek() !== '`') {
        if (this.peek() === '\\') {
          value += this.advance();
          value += this.advance();
        } else if (this.peek() === '$' && this.peek(1) === '{') {
          hasInterpolation = true;
          break;
        } else {
          value += this.advance();
        }
      }
      if (hasInterpolation) {
        // Return partial template
        return { type: 'template_start', value, pos: startPos };
      }
      this.advance(); // closing backtick
      return { type: 'template_literal', value, pos: startPos };
    }

    // Multi-char operators
    const twoChar = ch + this.peek(1);
    const threeChar = ch + this.peek(1) + this.peek(2);

    if (threeChar === '...') {
      this.advance();
      this.advance();
      this.advance();
      return { type: '...', value: '...', pos: startPos };
    }

    if (twoChar === '<=' || twoChar === '>=' || twoChar === '==' || twoChar === '!=' || twoChar === '=>') {
      this.advance();
      this.advance();
      return { type: twoChar, value: twoChar, pos: startPos };
    }

    // Single char tokens
    const token = this.advance();
    return { type: token, value: token, pos: startPos };
  }

  peekToken(): Token | null {
    const saved = this.pos;
    const result = this.nextToken();
    this.pos = saved;
    return result;
  }

  getPos(): number {
    return this.pos;
  }

  setPos(pos: number): void {
    this.pos = pos;
  }
}

// Parser
export class TypeParser {
  private types: Map<string, AnyType> = new Map();

  constructor(definitions: string) {
    this.parseDefinitions(definitions);
  }

  private parseDefinitions(text: string) {
    // Extract type aliases: type X<...> = ...;
    // More robust parsing that handles nested braces/brackets
    let pos = 0;
    while (pos < text.length) {
      const typeIdx = text.indexOf('type ', pos);
      if (typeIdx === -1) break;

      pos = typeIdx + 5; // skip 'type '

      // Get type name
      const nameMatch = text.substring(pos).match(/^(\w+)/);
      if (!nameMatch) break;
      const name = nameMatch[1];
      pos += name.length;

      // Skip type parameters if present
      if (text[pos] === '<') {
        let depth = 1;
        pos++;
        while (pos < text.length && depth > 0) {
          if (text[pos] === '<') depth++;
          if (text[pos] === '>') depth--;
          pos++;
        }
      }

      // Skip whitespace and find =
      while (pos < text.length && /\s/.test(text[pos])) pos++;
      if (text[pos] !== '=') {
        if (process.env.DEBUG) console.error(`Expected '=' for type ${name}, found '${text[pos]}'`);
        break;
      }
      pos++; // skip =

      // Find the end of this type - either semicolon or next "type " keyword
      let depth = 0;
      let bodyStart = pos;
      let inString = false;
      let stringChar = '';
      let inTemplate = false;

      while (pos < text.length) {
        // Check for next type keyword (at depth 0)
        if (depth === 0 && text.substring(pos).match(/^\n\s*type\s+\w+</)) {
          break;
        }

        // Check for function keyword (end of current type block)
        if (depth === 0 && text.substring(pos).match(/^\n\s*function\s+/)) {
          break;
        }

        const ch = text[pos];

        // Handle strings
        if ((ch === '"' || ch === "'") && text[pos - 1] !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = ch;
          } else if (ch === stringChar) {
            inString = false;
          }
        }

        // Handle template literals
        if (ch === '`' && text[pos - 1] !== '\\') {
          inTemplate = !inTemplate;
        }

        // Track nesting
        if (!inString && !inTemplate) {
          if (ch === '{' || ch === '[' || ch === '(') depth++;
          if (ch === '}' || ch === ']' || ch === ')') depth--;
          if (ch === ';' && depth === 0) {
            pos++; // include the semicolon
            break;
          }
        }

        pos++;
      }

      const body = text.substring(bodyStart, pos).trim();

      if (process.env.DEBUG) {
        console.log(`Type ${name}: body starts at ${bodyStart}, ends at ${pos}, length=${body.length}`);
      }

      try {
        const typeNode = this.parseTypeExpression(body);
        this.types.set(name, typeNode);
        if (process.env.DEBUG) console.log(`Parsed type: ${name}`);
      } catch (e) {
        // Log errors for debugging
        if (process.env.DEBUG) {
          console.error(`Failed to parse type ${name}:`, (e as Error).message);
        }
      }

      if (pos < text.length && text[pos] === ';') {
        pos++; // skip semicolon
      }
    }
  }

  private parseTypeExpression(expr: string): AnyType {
    const tokenizer = new TypeTokenizer(expr.trim());
    const result = this.parseConditional(tokenizer);
    return result || { kind: 'unknown', text: expr };
  }

  private parseConditional(tokenizer: TypeTokenizer): TypeNode {
    const check = this.parseUnion(tokenizer);

    const next = tokenizer.peekToken();
    if (next?.value === 'extends') {
      tokenizer.nextToken(); // consume 'extends'
      const extendsType = this.parseUnion(tokenizer);

      const next2 = tokenizer.peekToken();
      if (next2?.value === '?') {
        tokenizer.nextToken(); // consume '?'
        const trueType = this.parseUnion(tokenizer);

        const next3 = tokenizer.peekToken();
        if (next3?.value === ':') {
          tokenizer.nextToken(); // consume ':'
          const falseType = this.parseConditional(tokenizer);

          return {
            kind: 'conditional',
            text: `${check.text} extends ${extendsType.text} ? ${trueType.text} : ${falseType.text}`,
            check,
            extends: extendsType,
            trueType,
            falseType,
          };
        }
      }
    }

    return check;
  }

  private parseUnion(tokenizer: TypeTokenizer): TypeNode {
    const members: TypeNode[] = [];
    members.push(this.parseIntersection(tokenizer));

    while (tokenizer.peekToken()?.value === '|') {
      tokenizer.nextToken(); // consume '|'
      members.push(this.parseIntersection(tokenizer));
    }

    if (members.length === 1) {
      return members[0];
    }

    return {
      kind: 'union',
      text: members.map(m => m.text).join(' | '),
      members,
    };
  }

  private parseIntersection(tokenizer: TypeTokenizer): TypeNode {
    const members: TypeNode[] = [];
    members.push(this.parsePrimary(tokenizer));

    while (tokenizer.peekToken()?.value === '&') {
      tokenizer.nextToken(); // consume '&'
      members.push(this.parsePrimary(tokenizer));
    }

    if (members.length === 1) {
      return members[0];
    }

    return {
      kind: 'intersection',
      text: members.map(m => m.text).join(' & '),
      members,
    };
  }

  private parsePrimary(tokenizer: TypeTokenizer): TypeNode {
    let token = tokenizer.nextToken();
    if (!token) {
      return { kind: 'unknown', text: '' };
    }

    // Keywords: readonly, infer
    if (token.value === 'readonly') {
      const operand = this.parsePrimary(tokenizer);
      return {
        kind: 'type_operator',
        operator: 'readonly',
        operand,
        text: `readonly ${operand.text}`,
      };
    }

    if (token.value === 'infer') {
      const nameToken = tokenizer.nextToken();
      if (!nameToken) return { kind: 'unknown', text: 'infer' };
      return {
        kind: 'infer',
        name: nameToken.value,
        text: `infer ${nameToken.value}`,
      };
    }

    if (token.value === 'keyof') {
      const operand = this.parsePrimary(tokenizer);
      return {
        kind: 'type_operator',
        operator: 'keyof',
        operand,
        text: `keyof ${operand.text}`,
      };
    }

    if (token.value === 'typeof') {
      const operand = this.parsePrimary(tokenizer);
      return {
        kind: 'type_operator',
        operator: 'typeof',
        operand,
        text: `typeof ${operand.text}`,
      };
    }

    // String literal
    if (token.type === 'string_literal') {
      return {
        kind: 'string_literal',
        text: `"${token.value}"`,
        value: token.value,
      };
    }

    // Number literal
    if (token.type === 'number') {
      return {
        kind: 'number_literal',
        text: token.value,
        value: parseInt(token.value),
      };
    }

    // Template literal
    if (token.type === 'template_literal') {
      return {
        kind: 'template_literal',
        text: `\`${token.value}\``,
        parts: [token.value],
      };
    }

    // Object type: { ... }
    if (token.value === '{') {
      return this.parseObjectType(tokenizer);
    }

    // Array syntax: [...]
    if (token.value === '[') {
      return this.parseArray(tokenizer);
    }

    // Parenthesized expression
    if (token.value === '(') {
      const inner = this.parseConditional(tokenizer);
      tokenizer.nextToken(); // consume ')'
      return inner;
    }

    // Identifier - could be type ref or generic call
    if (token.type === 'ident') {
      const name = token.value;

      // Check for generic call
      if (tokenizer.peekToken()?.value === '<') {
        tokenizer.nextToken(); // consume '<'

        const typeArgs: TypeNode[] = [];
        while (tokenizer.peekToken()?.value !== '>' && tokenizer.peekToken() !== null) {
          if (typeArgs.length > 0) {
            if (tokenizer.peekToken()?.value === ',') {
              tokenizer.nextToken();
            }
          }
          typeArgs.push(this.parseConditional(tokenizer));
        }

        if (tokenizer.peekToken()?.value === '>') {
          tokenizer.nextToken(); // consume '>'
        }

        // Check for index access: Type<...>[...]
        if (tokenizer.peekToken()?.value === '[') {
          tokenizer.nextToken(); // consume '['
          const index = this.parseConditional(tokenizer);
          if (tokenizer.peekToken()?.value === ']') {
            tokenizer.nextToken(); // consume ']'
          }

          const objectType: GenericType = {
            kind: 'generic',
            name,
            text: `${name}<${typeArgs.map(a => a.text).join(', ')}>`,
            typeArgs,
          };

          return {
            kind: 'index_access',
            text: `${objectType.text}[${index.text}]`,
            object: objectType,
            index,
          };
        }

        return {
          kind: 'generic',
          text: `${name}<${typeArgs.map(a => a.text).join(', ')}>`,
          name,
          typeArgs,
        };
      }

      // Check for index access: Type[...]
      if (tokenizer.peekToken()?.value === '[') {
        tokenizer.nextToken(); // consume '['
        const index = this.parseConditional(tokenizer);
        if (tokenizer.peekToken()?.value === ']') {
          tokenizer.nextToken(); // consume ']'
        }

        return {
          kind: 'index_access',
          text: `${name}[${index.text}]`,
          object: { kind: 'type_ref', name, text: name },
          index,
        };
      }

      return {
        kind: 'type_ref',
        text: name,
        name,
      };
    }

    return { kind: 'unknown', text: token.value };
  }

  private parseObjectType(tokenizer: TypeTokenizer): ObjectType {
    const properties: Record<string, TypeNode> = {};
    let text = '{';

    while (tokenizer.peekToken()?.value !== '}' && tokenizer.peekToken() !== null) {
      const keyToken = tokenizer.nextToken();
      if (!keyToken) break;

      if (keyToken.value === '}') break;

      // Computed property: [k in Keys]
      if (keyToken.value === '[') {
        // Mapped type syntax
        const keyName = tokenizer.nextToken()?.value || 'k';
        const inToken = tokenizer.nextToken(); // should be 'in'
        const keyConstraint = this.parsePrimary(tokenizer);
        if (tokenizer.peekToken()?.value === ']') {
          tokenizer.nextToken();
        }
        if (tokenizer.peekToken()?.value === ':') {
          tokenizer.nextToken();
        }
        const valueType = this.parseConditional(tokenizer);
        properties[`[${keyName} in ...]`] = valueType;
      } else {
        // Regular property
        const keyName = keyToken.value;

        // Check for optional
        if (tokenizer.peekToken()?.value === '?') {
          tokenizer.nextToken();
        }

        if (tokenizer.peekToken()?.value === ':') {
          tokenizer.nextToken();
        }

        const valueType = this.parseConditional(tokenizer);
        properties[keyName] = valueType;
      }

      if (tokenizer.peekToken()?.value === ',') {
        tokenizer.nextToken();
      }
    }

    if (tokenizer.peekToken()?.value === '}') {
      tokenizer.nextToken();
    }

    return {
      kind: 'object',
      text: `{ ... }`,
      properties,
    };
  }

  private parseArray(tokenizer: TypeTokenizer): TypeNode {
    // Check for readonly
    let readonly = false;
    if (tokenizer.peekToken()?.value === 'readonly') {
      tokenizer.nextToken();
      readonly = true;
    }

    // Handle mapped type in bracket: [k in Keys]: Type
    if (tokenizer.peekToken()?.type === 'ident' && tokenizer.peekToken()?.value === 'k') {
      const keyName = tokenizer.nextToken()?.value || 'k';
      if (tokenizer.peekToken()?.value === 'in') {
        tokenizer.nextToken();
        const keyConstraint = this.parseConditional(tokenizer);
        if (tokenizer.peekToken()?.value === ']') {
          tokenizer.nextToken();
        }
        if (tokenizer.peekToken()?.value === ':') {
          tokenizer.nextToken();
        }
        const valueType = this.parseConditional(tokenizer);

        return {
          kind: 'mapped',
          text: `[${keyName} in ...]: ...`,
          key: keyName,
          keyConstraint,
          valueType,
          readonly,
        };
      }
    }

    // Regular array: Type[]
    const elementType = this.parseConditional(tokenizer);
    if (tokenizer.peekToken()?.value === ']') {
      tokenizer.nextToken();
    }

    return {
      kind: 'array',
      text: `${elementType.text}[]`,
      elementType,
      readonly,
    };
  }

  getType(name: string): AnyType | undefined {
    return this.types.get(name);
  }

  getAllTypes(): Map<string, AnyType> {
    return this.types;
  }
}
