/**
 * Theme-appropriate colors for book covers that cycle through a curated palette.
 * These colors are designed to complement the Modern Library theme.
 */

export const themeColors = [
  // Deep, rich colors that work well with the cream background
  'rgba(58, 58, 58, 0.75)',      // Dark gray (matches text-ink)
  'rgba(180, 140, 79, 0.75)',    // Gold (matches accent-gold)
  'rgba(156, 120, 66, 0.75)',    // Darker gold (matches accent-gold-hover)
  'rgba(106, 122, 131, 0.75)',   // Slate blue-gray
  'rgba(139, 69, 19, 0.75)',     // Saddle brown
  'rgba(85, 107, 47, 0.75)',     // Dark olive green
  'rgba(72, 61, 139, 0.75)',     // Dark slate blue
  'rgba(128, 0, 0, 0.75)',       // Maroon
  'rgba(47, 79, 79, 0.75)',      // Dark slate gray
  'rgba(160, 82, 45, 0.75)',     // Sienna
];

/**
 * Gets a color from the theme palette based on an index.
 * Cycles through the available colors.
 * 
 * @param index - The index to get a color for
 * @returns A theme-appropriate color string
 */
export function getThemeColor(index: number): string {
  return themeColors[index % themeColors.length];
}

/**
 * Gets a color from the theme palette based on a string (like book title or author).
 * Creates consistent colors for the same input.
 * 
 * @param input - The string to generate a color for
 * @returns A theme-appropriate color string
 */
export function getColorForString(input: string): string {
  // Simple hash function to convert string to number
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % themeColors.length;
  return themeColors[index];
} 