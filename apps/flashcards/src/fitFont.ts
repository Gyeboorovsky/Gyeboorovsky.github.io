/** Auto-size study-card text by length (from the design comp, +1 step for long sentences). */
export function fitFont(text: string): string {
  const len = text.length;
  if (len > 60) return '16px';
  if (len > 28) return '19px';
  if (len > 18) return '24px';
  if (len > 10) return '30px';
  return '38px';
}
