"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { measureText, FONTS, type MeasurementResult } from "@/lib/pretext";
import { cn } from "@/lib/utils";

type TextVariant = "h1" | "h2" | "h3" | "post-title" | "post-subtitle" | "body-serif" | "body-sans" | "metadata" | "comment";

interface OptimizedTextProps {
  text: string;
  variant: TextVariant;
  maxLines?: number;
  className?: string;
  as?: React.ElementType;
  showReadMore?: boolean;
}

const VARIANT_CONFIG: Record<TextVariant, { fontSize: number; lineHeight: number; fontFamily: string; fontWeight: number | string }> = {
  h1: { fontSize: 48, lineHeight: 1.2 * 48, fontFamily: FONTS.SERIF, fontWeight: 700 },
  h2: { fontSize: 32, lineHeight: 1.2 * 32, fontFamily: FONTS.SERIF, fontWeight: 700 },
  h3: { fontSize: 24, lineHeight: 1.3 * 24, fontFamily: FONTS.SERIF, fontWeight: 700 },
  "post-title": { fontSize: 24, lineHeight: 1.2 * 24, fontFamily: FONTS.SERIF, fontWeight: 700 },
  "post-subtitle": { fontSize: 16, lineHeight: 1.6 * 16, fontFamily: FONTS.SANS, fontWeight: 400 },
  "body-serif": { fontSize: 20, lineHeight: 1.6 * 20, fontFamily: FONTS.SERIF, fontWeight: 400 },
  "body-sans": { fontSize: 16, lineHeight: 1.5 * 16, fontFamily: FONTS.SANS, fontWeight: 400 },
  metadata: { fontSize: 12, lineHeight: 1.2 * 12, fontFamily: FONTS.SANS, fontWeight: 500 },
  comment: { fontSize: 14, lineHeight: 1.5 * 14, fontFamily: FONTS.SANS, fontWeight: 400 },
};

export function OptimizedText({
  text,
  variant,
  maxLines,
  className,
  as: Component = "p",
  showReadMore = false,
}: OptimizedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurement, setMeasurement] = useState<MeasurementResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const config = VARIANT_CONFIG[variant];

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateMeasurement = () => {
      const width = containerRef.current?.offsetWidth || 0;
      if (width === 0) return;

      const result = measureText(text, {
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        lineHeight: config.lineHeight,
        maxWidth: width,
        maxLines: isExpanded ? undefined : maxLines,
      });

      setMeasurement(result);
    };

    updateMeasurement();

    // Re-measure on window resize
    window.addEventListener("resize", updateMeasurement);
    return () => window.removeEventListener("resize", updateMeasurement);
  }, [text, config, maxLines, isExpanded]);

  // Initial render / SSR: uses standard CSS truncation (line-clamp)
  // until pretext measurement is ready. This ensures content is visible immediately.
  const isReady = !!measurement;
  
  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Component
        className={cn(
          !isReady && maxLines && `line-clamp-${maxLines}`,
          "transition-opacity duration-200",
          !isReady ? "opacity-50" : "opacity-100"
        )}
        style={{
          fontFamily: config.fontFamily,
          fontSize: `${config.fontSize}px`,
          lineHeight: `${config.lineHeight}px`,
          fontWeight: config.fontWeight,
          minHeight: measurement ? `${measurement.height}px` : "1.2em",
        }}
      >
        {isReady ? measurement.visibleText : text}
      </Component>

      {showReadMore && measurement?.isTruncated && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs font-semibold text-[#D4A373] mt-1 hover:underline focus:outline-none"
        >
          Read more
        </button>
      )}
    </div>
  );
}
