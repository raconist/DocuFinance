/**
 * DocuFinance AI - Tax, VAT (KDV) & Withholding (Stopaj) Estimation Engine
 * Calculates:
 * - Net VAT (KDV): Calculated (Hesaplanan KDV %20) vs Deductible (İndirilecek KDV %20/%10)
 * - Estimated Provisional Tax (Geçici Vergi / Kurumlar Vergisi %25)
 * - Estimated Withholding Tax (Stopaj %20)
 */

export function calculateEstimatedTaxes(transactions = [], options = {}) {
  const { corporateTaxRate = 0.25, defaultKdvRate = 0.20 } = options;

  let totalIncome = 0;
  let totalExpense = 0;
  let calculatedKdv = 0; // Satışlardan doğan KDV (391)
  let deductibleKdv = 0; // Giderlerden doğan KDV (191)
  let estimatedStopaj = 0; // Kira / Serbest Meslek stopajı (360)

  transactions.forEach(tx => {
    const amount = Number(tx.amount || tx.tutar || (tx.credit || 0) - (tx.debit || 0)) || 0;
    const desc = (tx.description || tx.aciklama || '').toUpperCase();
    const cat = tx.category || '';

    if (amount > 0) {
      // Income (Gelir)
      totalIncome += amount;
      // Assume income is VAT-inclusive or calculate base matrah
      const baseMatrah = amount / (1 + defaultKdvRate);
      calculatedKdv += (amount - baseMatrah);
    } else {
      // Expense (Gider)
      const absAmount = Math.abs(amount);
      totalExpense += absAmount;

      // Check if item has deductible VAT (e.g. food, fuel, office, telecom)
      const isDeductible = !desc.includes('VERGI') && !desc.includes('SGK') && !desc.includes('MAAS') && !desc.includes('BSMV');
      if (isDeductible) {
        const rate = (desc.includes('MIGROS') || desc.includes('YEMEK')) ? 0.10 : defaultKdvRate;
        const baseMatrah = absAmount / (1 + rate);
        deductibleKdv += (absAmount - baseMatrah);
      }

      // Check for rent / professional services (Stopaj)
      if (desc.includes('KIRA') || desc.includes('AVUKAT') || desc.includes('SERBEST MESLEK')) {
        estimatedStopaj += absAmount * 0.20;
      }
    }
  });

  const netVatPayable = Math.max(0, calculatedKdv - deductibleKdv);
  const nextMonthDeferredVat = Math.max(0, deductibleKdv - calculatedKdv);
  const netProfit = Math.max(0, totalIncome - totalExpense);
  const estimatedCorporateTax = netProfit * corporateTaxRate;
  const totalTaxLiability = netVatPayable + estimatedCorporateTax + estimatedStopaj;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    calculatedKdv: Math.round(calculatedKdv * 100) / 100,
    deductibleKdv: Math.round(deductibleKdv * 100) / 100,
    netVatPayable: Math.round(netVatPayable * 100) / 100,
    nextMonthDeferredVat: Math.round(nextMonthDeferredVat * 100) / 100,
    estimatedCorporateTax: Math.round(estimatedCorporateTax * 100) / 100,
    estimatedStopaj: Math.round(estimatedStopaj * 100) / 100,
    totalTaxLiability: Math.round(totalTaxLiability * 100) / 100,
    corporateTaxRate: corporateTaxRate * 100,
    kdvRate: defaultKdvRate * 100
  };
}
