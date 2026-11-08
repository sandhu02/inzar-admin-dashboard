import { describe, it, expect } from 'vitest';

// Contrast calculation helper according to WCAG 2.1 specs
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = getLuminance(r1, g1, b1);
  const l2 = getLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens Contrast Verification', () => {
  it('dark theme primary text (#F2EDE4) on dark background (#12110F) meets WCAG AAA', () => {
    const ratio = getContrastRatio('#F2EDE4', '#12110F');
    // AA requires >= 4.5:1, AAA requires >= 7:1
    expect(ratio).toBeGreaterThan(10);
  });

  it('dark theme secondary text (#A8A094) on dark background (#12110F) meets WCAG AA', () => {
    const ratio = getContrastRatio('#A8A094', '#12110F');
    expect(ratio).toBeGreaterThan(4.5);
  });

  it('signal orange (#FF6B2C) on dark background (#12110F) has high readability', () => {
    const ratio = getContrastRatio('#FF6B2C', '#12110F');
    expect(ratio).toBeGreaterThan(4.5);
  });

  it('light theme primary text (#1C1A17) on light background (#F9F8F6) meets WCAG AAA', () => {
    const ratio = getContrastRatio('#1C1A17', '#F9F8F6');
    expect(ratio).toBeGreaterThan(10);
  });
});
