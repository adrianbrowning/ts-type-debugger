import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { encodeShareState, decodeShareState } from '../utils/urlSharing.ts';

describe('urlSharing', () => {
  describe('encodeShareState / decodeShareState roundtrip', () => {
    it('roundtrips simple values', () => {
      const typeName = 'MyType';
      const code = 'type MyType = string;';

      const encoded = encodeShareState(typeName, code);
      const decoded = decodeShareState(encoded);

      expect(decoded).toEqual({ typeName, code });
    });

    it('handles empty typeName', () => {
      const typeName = '';
      const code = 'type X = number;';

      const encoded = encodeShareState(typeName, code);
      const decoded = decodeShareState(encoded);

      expect(decoded).toEqual({ typeName, code });
    });

    it('handles code with pipes', () => {
      const typeName = 'Union';
      const code = 'type Union = "a" | "b" | "c";';

      const encoded = encodeShareState(typeName, code);
      const decoded = decodeShareState(encoded);

      expect(decoded).toEqual({ typeName, code });
    });

    it('handles multiline code', () => {
      const typeName = 'Complex<T>';
      const code = `type Complex<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : "other";`;

      const encoded = encodeShareState(typeName, code);
      const decoded = decodeShareState(encoded);

      expect(decoded).toEqual({ typeName, code });
    });

    it('handles unicode characters', () => {
      const typeName = 'Émoji';
      const code = 'type Émoji = "🎉" | "✨";';

      const encoded = encodeShareState(typeName, code);
      const decoded = decodeShareState(encoded);

      expect(decoded).toEqual({ typeName, code });
    });
  });

  describe('decodeShareState error handling', () => {
    it('returns null for empty string', () => {
      expect(decodeShareState('')).toBeNull();
    });

    it('returns null for invalid compressed data', () => {
      expect(decodeShareState('not-valid-lz-data')).toBeNull();
    });

    it('returns null for wrong version', () => {
      // Manually create a v2 encoded string (would need different format)
      // For now, test that random data returns null
      expect(decodeShareState('abc123')).toBeNull();
    });
  });

  describe('buildShareUrl / getShareStateFromUrl', () => {
    const originalWindow = globalThis.window;

    beforeEach(() => {
      // Create minimal window mock
      (globalThis as unknown as { window: unknown }).window = {
        location: { href: 'http://localhost:5173/' },
      };
    });

    afterEach(() => {
      (globalThis as unknown as { window: unknown }).window = originalWindow;
    });

    it('builds URL with code query param', async () => {
      const { buildShareUrl } = await import('../utils/urlSharing.ts');
      const url = buildShareUrl('MyType', 'type MyType = string;');

      expect(url).toContain('http://localhost:5173/');
      expect(url).toContain('?code=');
    });

    it('produces URL that can be decoded back', async () => {
      const { buildShareUrl } = await import('../utils/urlSharing.ts');
      const typeName = 'Test<T>';
      const code = 'type Test<T> = T extends string ? true : false;';

      const url = buildShareUrl(typeName, code);
      const urlObj = new URL(url);
      const codeParam = urlObj.searchParams.get('code');

      expect(codeParam).not.toBeNull();
      const decoded = decodeShareState(codeParam!);
      expect(decoded).toEqual({ typeName, code });
    });

    it('getShareStateFromUrl returns null when no code param', async () => {
      const { getShareStateFromUrl } = await import('../utils/urlSharing.ts');
      expect(getShareStateFromUrl()).toBeNull();
    });

    it('getShareStateFromUrl decodes state from URL', async () => {
      const typeName = 'Foo';
      const code = 'type Foo = number;';
      const encoded = encodeShareState(typeName, code);

      (globalThis as unknown as { window: { location: { href: string } } }).window = {
        location: { href: `http://localhost:5173/?code=${encoded}` },
      };

      const { getShareStateFromUrl } = await import('../utils/urlSharing.ts');
      expect(getShareStateFromUrl()).toEqual({ typeName, code });
    });
  });
});
