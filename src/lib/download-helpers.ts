/**
 * Helper function to get the content type and color for an asset.
 */
export function getAssetLabelAndColor(assetName: string): { label: string; colorClasses: string } {
  // Extract content type from filename (before the file extension)
  if (assetName.includes('-annotated.')) {
    return { label: 'Annotated', colorClasses: 'bg-amber-100 text-amber-800' };
  }
  if (assetName.includes('-modernized.')) {
    return { label: 'Modernized', colorClasses: 'bg-emerald-100 text-emerald-800' };
  }
  if (assetName.includes('-original.')) {
    return { label: 'Original', colorClasses: 'bg-slate-100 text-slate-800' };
  }
  if (assetName.endsWith('-metadata.json')) {
    return { label: 'Metadata', colorClasses: 'bg-stone-100 text-stone-800' };
  }

  // Fallback for files that don't follow the naming convention
  return { label: 'Other', colorClasses: 'bg-gray-100 text-gray-600' };
}

/**
 * Helper function to get sort priority for assets (lower numbers appear first).
 */
export function getAssetSortPriority(assetName: string): number {
  if (assetName.includes('-annotated.')) return 1;
  if (assetName.includes('-modernized.')) return 2;
  if (assetName.includes('-original.')) return 3;
  if (assetName.endsWith('-metadata.json')) return 4;
  return 5; // Other files
}
