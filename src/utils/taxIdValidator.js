/**
 * DocuFinance AI - Tax ID (VKN / TCKN) & IBAN Algorithmic Validation Engine
 * Implements official GİB checksum formulas and international ISO 13616 IBAN MOD-97 check.
 */

/**
 * Validate Turkish Corporate Tax Number (VKN - 10 digits)
 */
export function validateVKN(vkn = '') {
  const clean = String(vkn).replace(/\D/g, '');
  if (clean.length !== 10) return false;

  const digits = clean.split('').map(Number);
  const lastDigit = digits[9];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const c = (digits[i] + (9 - i)) % 10;
    const v = (c * Math.pow(2, 9 - i)) % 9;
    sum += (c !== 0 && v === 0) ? 9 : v;
  }

  const calculatedLastDigit = (10 - (sum % 10)) % 10;
  return calculatedLastDigit === lastDigit;
}

/**
 * Validate Turkish Individual ID Number (TCKN - 11 digits)
 */
export function validateTCKN(tckn = '') {
  const clean = String(tckn).replace(/\D/g, '');
  if (clean.length !== 11 || clean[0] === '0') return false;

  const d = clean.split('').map(Number);

  // 10th digit rule: ((d0+d2+d4+d6+d8)*7 - (d1+d3+d5+d7)) % 10 === d9
  const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
  const evenSum = d[1] + d[3] + d[5] + d[7];
  const digit10 = ((oddSum * 7) - evenSum) % 10;
  const d9Expected = (digit10 + 10) % 10;

  if (d[9] !== d9Expected) return false;

  // 11th digit rule: (sum(d0..d9)) % 10 === d10
  const first10Sum = d.slice(0, 10).reduce((acc, v) => acc + v, 0);
  return (first10Sum % 10) === d[10];
}

/**
 * Validate International / Turkish IBAN (ISO 13616 MOD-97)
 */
export function validateIBAN(iban = '') {
  const clean = String(iban).replace(/[^A-Z0-9]/gi, '').toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;

  // Move first 4 chars to end
  const rearranged = clean.slice(4) + clean.slice(0, 4);

  // Convert letters to numbers (A=10, B=11... Z=35)
  let numeric = '';
  for (let i = 0; i < rearranged.length; i++) {
    const code = rearranged.charCodeAt(i);
    if (code >= 65 && code <= 90) {
      numeric += (code - 55).toString();
    } else {
      numeric += rearranged[i];
    }
  }

  // Calculate MOD 97 using chunking for large strings
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = remainder.toString() + numeric.substring(i, i + 7);
    remainder = parseInt(chunk, 10) % 97;
  }

  return remainder === 1;
}
