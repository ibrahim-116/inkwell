import { layoutWithLines, type PreparedTextWithSegments, prepareWithSegments } from "@chenglou/pretext";

/**
 * Utility for high-performance text measurement and layout using @chenglou/pretext.
 * This avoids expensive browser layout reflows by calculating text dimensions in memory.
 */

export interface TextMeasurementOptions {
  fontSize: number;
  fontFamily: string;
  fontWeight?: string | number;
  lineHeight: number;
  maxWidth: number;
  maxLines?: number;
}

export interface MeasurementResult {
  height: number;
  lineCount: number;
  isTruncated: boolean;
  visibleText: string;
}

// Simple LRU-style cache to avoid re-preparing the same text/font combinations
const preparationCache = new Map<string, PreparedTextWithSegments>();
const MAX_CACHE_SIZE = 500;

function getCacheKey(text: string, font: string): string {
  return `${font}|${text}`;
}

/**
 * Measures text and returns layout information.
 */
export function measureText(
  text: string,
  options: TextMeasurementOptions
): MeasurementResult {
  if (typeof window === "undefined") {
    // Fallback for SSR
    return {
      height: options.lineHeight * (options.maxLines || 1),
      lineCount: 1,
      isTruncated: false,
      visibleText: text,
    };
  }

  const fontString = `${options.fontWeight || 400} ${options.fontSize}px ${options.fontFamily}`;
  const cacheKey = getCacheKey(text, fontString);

  let prepared = preparationCache.get(cacheKey);
  if (!prepared) {
    prepared = prepareWithSegments(text, fontString);
    
    // Manage cache size
    if (preparationCache.size >= MAX_CACHE_SIZE) {
      const firstKey = preparationCache.keys().next().value;
      if (firstKey !== undefined) preparationCache.delete(firstKey);
    }
    preparationCache.set(cacheKey, prepared);
  }

  const result = layoutWithLines(prepared, options.maxWidth, options.lineHeight);

  if (options.maxLines && result.lineCount > options.maxLines) {
    const visibleLines = result.lines.slice(0, options.maxLines);
    
    // Basic ellipsis handling - in a more advanced version, we'd use pretext 
    // to find the exact character position to insert the ellipsis.
    const visibleText = visibleLines.map(l => l.text).join("");
    
    return {
      height: options.maxLines * options.lineHeight,
      lineCount: options.maxLines,
      isTruncated: true,
      visibleText: visibleText.slice(0, -3) + "...",
    };
  }

  return {
    height: result.height,
    lineCount: result.lineCount,
    isTruncated: false,
    visibleText: text,
  };
}

/**
 * Pre-calculates font-family strings based on project design tokens.
 */
export const FONTS = {
  SANS: "var(--font-sans), Inter, system-ui, sans-serif",
  SERIF: "var(--font-serif), 'Source Serif 4', Georgia, serif",
};
