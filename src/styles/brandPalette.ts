// Brand palette & neutral/placeholder constants (FR-015 externalization)
// Centralized so code generation & style logic can import without duplicating literals.

export const BRAND_PALETTE = ['#3366cc', '#ff6600'] as const;
export const NEUTRAL_COLOR = '#000000';
export const PLACEHOLDER_COLOR = '#999999';

export type BrandColor = typeof BRAND_PALETTE[number];
