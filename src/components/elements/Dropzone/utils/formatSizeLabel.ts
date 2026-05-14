export const formatMaxSizeLabel = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  if (Math.abs(mb - Math.round(mb)) < 0.001) return `${Math.round(mb)}MB`;
  return `${mb.toFixed(1)}MB`;
};
