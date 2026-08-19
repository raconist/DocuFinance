/**
 * DocuFinance AI - Balanced Double-Entry Journal Voucher Engine
 * Generates Borç / Alacak balanced accounting vouchers for Turkish TDHP (Luca, Zirve, Logo, Datasoft)
 */

export function generateJournalEntries(transactions = [], options = {}) {
  const { bankAccountCode = '102.01.001', defaultVatAccount = '191.01.020' } = options;

  const entries = [];
  let totalDebit = 0;
  let totalCredit = 0;

  transactions.forEach((tx, idx) => {
    const amount = Number(tx.amount || tx.tutar || (tx.credit || 0) - (tx.debit || 0)) || 0;
    const desc = tx.description || tx.aciklama || 'Banka Hareketi';
    const date = tx.date || tx.tarih || new Date().toISOString().slice(0, 10);
    const voucherNo = `YEV-${date.replace(/[^0-9]/g, '')}-${idx + 1}`;
    const accountCode = tx.accountCode || (amount > 0 ? '600.01.001' : '770.99.001');

    const absAmount = Math.abs(amount);

    if (amount > 0) {
      // Para Girişi (Tahsilat / Satış):
      // Borç: 102 Banka
      // Alacak: 600 Satış veya 120 Alıcı
      entries.push({
        voucherNo,
        date,
        lineNo: 1,
        accountCode: bankAccountCode,
        accountName: 'Banka Hesabı',
        description: desc,
        debit: absAmount,
        credit: 0
      });
      entries.push({
        voucherNo,
        date,
        lineNo: 2,
        accountCode,
        accountName: tx.category || 'Satış / Gelir',
        description: desc,
        debit: 0,
        credit: absAmount
      });
      totalDebit += absAmount;
      totalCredit += absAmount;
    } else {
      // Para Çıkışı (Ödeme / Gider):
      // Borç: 770 Gider / 320 Satıcı
      // Alacak: 102 Banka
      entries.push({
        voucherNo,
        date,
        lineNo: 1,
        accountCode,
        accountName: tx.category || 'Gider Hesabı',
        description: desc,
        debit: absAmount,
        credit: 0
      });
      entries.push({
        voucherNo,
        date,
        lineNo: 2,
        accountCode: bankAccountCode,
        accountName: 'Banka Hesabı',
        description: desc,
        debit: 0,
        credit: absAmount
      });
      totalDebit += absAmount;
      totalCredit += absAmount;
    }
  });

  return {
    entries,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
  };
}
