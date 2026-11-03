/**
 * Formats a string to Title Case / Pascal Case for customer names
 * e.g. "SAI KRISHNA KIRANA AND GENERAL STORES" -> "Sai Krishna Kirana And General Stores"
 */
export function toTitleCase(str: string): string {
  if (!str) return str;
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Safely formats any numeric or string currency value without weird formatting artifacts
 * e.g. 10000 -> "10,000", "00100.00023.00" -> "123"
 */
export function formatCurrency(val: any): string {
  if (val === undefined || val === null || val === '') return '0';
  if (typeof val === 'number') {
    return isNaN(val) ? '0' : val.toLocaleString('en-IN');
  }
  const str = String(val).trim();
  // Check if it's a corrupted concatenated string with multiple dots like "00100.00023.00"
  if ((str.match(/\./g) || []).length > 1) {
    // Sum up each float chunk
    const parts = str.split(/(?<=\.\d{2})/);
    let total = 0;
    parts.forEach(p => {
      const parsed = parseFloat(p);
      if (!isNaN(parsed)) total += parsed;
    });
    return total.toLocaleString('en-IN');
  }
  const num = parseFloat(str);
  return isNaN(num) ? '0' : num.toLocaleString('en-IN');
}
