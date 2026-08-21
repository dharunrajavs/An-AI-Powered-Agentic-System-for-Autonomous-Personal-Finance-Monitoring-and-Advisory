import { formatCurrency, formatCompactCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats a positive number in INR', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1,234.56');
  });

  it('formats a negative number with minus sign', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500.00');
    expect(result.startsWith('-')).toBe(true);
  });

  it('shows plus sign for positive when showSign option is set', () => {
    const result = formatCurrency(100, { showSign: true });
    expect(result.startsWith('+')).toBe(true);
  });
});

describe('formatCompactCurrency', () => {
  it('formats thousands as K', () => {
    const result = formatCompactCurrency(2500);
    expect(result).toBe('₹2.5K');
  });

  it('formats lakhs as L', () => {
    const result = formatCompactCurrency(150000);
    expect(result).toBe('₹1.5L');
  });

  it('formats crores as Cr', () => {
    const result = formatCompactCurrency(25000000);
    expect(result).toBe('₹2.5Cr');
  });
});
