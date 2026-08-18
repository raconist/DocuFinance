/**
 * DocuFinance AI - Duplicate & Anomaly Transaction Detector
 * Identifies duplicate entries across multi-month or overlapping statement uploads.
 */

/**
 * Scan rows and flag duplicate transactions
 * @param {Array} rows 
 * @returns {{ rows: Array, duplicateCount: number, duplicateGroups: Object }}
 */
export function detectDuplicates(rows = []) {
  const signatures = new Map();
  let duplicateCount = 0;
  const duplicateGroups = {};

  // First pass: group by signature (Date + Amount + Normalized Description)
  rows.forEach((row, idx) => {
    const amountKey = ((row.credit || 0) - (row.debit || 0)).toFixed(2);
    const dateKey = (row.date || '').trim();
    const cleanDesc = (row.description || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20); // First 20 alphanumeric characters

    const signature = `${dateKey}_${amountKey}_${cleanDesc}`;

    if (!signatures.has(signature)) {
      signatures.set(signature, []);
    }
    signatures.get(signature).push(idx);
  });

  // Second pass: mark rows that appear more than once
  const updatedRows = rows.map((row, idx) => {
    const amountKey = ((row.credit || 0) - (row.debit || 0)).toFixed(2);
    const dateKey = (row.date || '').trim();
    const cleanDesc = (row.description || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);

    const signature = `${dateKey}_${amountKey}_${cleanDesc}`;
    const matchingIndices = signatures.get(signature) || [];

    if (matchingIndices.length > 1) {
      const isFirstInstance = matchingIndices[0] === idx;
      duplicateCount += isFirstInstance ? 0 : 1; // Count duplicates beyond the first
      
      if (!duplicateGroups[signature]) {
        duplicateGroups[signature] = [];
      }
      duplicateGroups[signature].push(idx);

      return {
        ...row,
        isDuplicate: !isFirstInstance,
        isDuplicateCandidate: true,
        duplicateGroupId: signature,
        duplicateMatchCount: matchingIndices.length
      };
    }

    return {
      ...row,
      isDuplicate: false,
      isDuplicateCandidate: false
    };
  });

  return {
    rows: updatedRows,
    duplicateCount,
    duplicateGroups
  };
}

/**
 * Remove duplicate rows, keeping only the first occurrence of each duplicate group
 * @param {Array} rows 
 * @returns {Array} Cleaned rows
 */
export function removeDuplicateRows(rows = []) {
  const { rows: processed } = detectDuplicates(rows);
  return processed.filter(r => !r.isDuplicate);
}
