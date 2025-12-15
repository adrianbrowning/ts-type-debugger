import LZString from 'lz-string';

const VERSION = 1;
const PARAM_NAME = 'code';

type ShareState = {
  typeName: string;
  code: string;
};

export const encodeShareState = (typeName: string, code: string): string => {
  const data = `${VERSION}|${typeName}|${code}`;
  return LZString.compressToEncodedURIComponent(data);
};

export const decodeShareState = (compressed: string): ShareState | null => {
  try {
    const data = LZString.decompressFromEncodedURIComponent(compressed);
    if (!data) return null;

    const [version, typeName, ...codeParts] = data.split('|');
    if (version !== '1') return null;
    if (typeName === undefined) return null;

    return { typeName, code: codeParts.join('|') };
  } catch {
    return null;
  }
};

export const buildShareUrl = (typeName: string, code: string): string => {
  const compressed = encodeShareState(typeName, code);
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM_NAME, compressed);
  return url.toString();
};

export const getShareStateFromUrl = (): ShareState | null => {
  const url = new URL(window.location.href);
  const compressed = url.searchParams.get(PARAM_NAME);
  if (!compressed) return null;
  return decodeShareState(compressed);
};
