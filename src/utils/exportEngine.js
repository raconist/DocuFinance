import * as XLSX from 'xlsx';
import { maskSensitiveData } from './security';

/**
 * DocuFinance AI - Native Multi-Format Export Engine
 * Generates styled Microsoft Excel (.xlsx), UTF-8 CSV with BOM, and JSON
 */

export function exportToExcel(parsedData, options = {}) {
  const {
    fileName = 'Banka_Ekstresi_DocuFinance',
    isMasked = false,
    includeAuditSheet = true,
    currency = 'TRY'
  } = options;

  const wb = XLSX.utils.book_new();

  // Prepare Transaction Rows
  const transactionRows = (parsedData.rows || []).map((row, index) => {
    let desc = row.description;
    if (isMasked) {
      desc = maskSensitiveData(desc);
    }

    return {
      'Sıra': index + 1,
      'İşlem Tarihi': row.date,
      'Açıklama / Detay': desc,
      'Kategori': row.category || 'Genel',
      'Borç / Çıkan (Gider)': row.debit > 0 ? row.debit : 0,
      'Alacak / Giren (Gelir)': row.credit > 0 ? row.credit : 0,
      'Net Tutar': row.amount || (row.credit - row.debit),
      'Kalan Bakiye': row.balance || 0
    };
  });

  // Create Transactions Worksheet
  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);

  // Set Column Widths for professional presentation
  wsTransactions['!cols'] = [
    { wch: 6 },   // Sıra
    { wch: 14 },  // Tarih
    { wch: 45 },  // Açıklama
    { wch: 18 },  // Kategori
    { wch: 20 },  // Borç
    { wch: 20 },  // Alacak
    { wch: 18 },  // Net Tutar
    { wch: 20 }   // Bakiye
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Hesap Hareketleri');

  // Add Summary / Audit Sheet if requested
  if (includeAuditSheet && parsedData.meta) {
    const meta = parsedData.meta;
    const summaryData = [
      { 'Finansal Rapor Özeti': 'Banka / Kurum', 'Değer': meta.bankName || 'Bilinmiyor' },
      { 'Finansal Rapor Özeti': 'Para Birimi', 'Değer': meta.currency || currency },
      { 'Finansal Rapor Özeti': 'Toplam İşlem Adedi', 'Değer': meta.transactionCount || transactionRows.length },
      { 'Finansal Rapor Özeti': 'Başlangıç Bakiyesi', 'Değer': meta.startingBalance || 0 },
      { 'Finansal Rapor Özeti': 'Toplam Giren (Gelir)', 'Değer': meta.totalCredit || 0 },
      { 'Finansal Rapor Özeti': 'Toplam Çıkan (Gider)', 'Değer': meta.totalDebit || 0 },
      { 'Finansal Rapor Özeti': 'Net Nakit Akışı', 'Değer': meta.netFlow || 0 },
      { 'Finansal Rapor Özeti': 'Hesaplanan Kapanış Bakiyesi', 'Değer': meta.calculatedEnding || 0 },
      { 'Finansal Rapor Özeti': 'Resmi Kapanış Bakiyesi', 'Değer': meta.endingBalance || 0 },
      { 'Finansal Rapor Özeti': 'Bakiye Mutabakatı (Reconciliation)', 'Değer': meta.isReconciled ? 'TAM MUTABAKAT (%100)' : 'KONTROL GEREKİYOR' },
      { 'Finansal Rapor Özeti': 'Dönüştürme Motoru', 'Değer': 'DocuFinance AI (Zero-Knowledge)' },
      { 'Finansal Rapor Özeti': 'Rapor Oluşturma Tarihi', 'Değer': new Date().toLocaleString('tr-TR') }
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Finansal Özet & Mutabakat');
  }

  // Trigger file download
  const cleanFileName = (fileName.replace(/\.xlsx$/i, '') || 'Banka_Ekstresi') + '.xlsx';
  XLSX.writeFile(wb, cleanFileName);
}

export function exportToCSV(parsedData, options = {}) {
  const {
    fileName = 'Banka_Ekstresi_DocuFinance',
    isMasked = false,
    delimiter = ';' // Semicolon default for Turkish Excel compatibility
  } = options;

  const headers = ['Sira', 'Tarih', 'Aciklama', 'Kategori', 'Borc', 'Alacak', 'Net_Tutar', 'Bakiye'];
  const rows = (parsedData.rows || []).map((row, index) => {
    let desc = (row.description || '').replace(new RegExp(delimiter, 'g'), ' ');
    if (isMasked) {
      desc = maskSensitiveData(desc);
    }
    return [
      index + 1,
      `"${row.date}"`,
      `"${desc}"`,
      `"${row.category || 'Genel'}"`,
      row.debit || 0,
      row.credit || 0,
      row.amount || (row.credit - row.debit),
      row.balance || 0
    ].join(delimiter);
  });

  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', (fileName.replace(/\.csv$/i, '') || 'Banka_Ekstresi') + '.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(parsedData, options = {}) {
  const { fileName = 'Banka_Ekstresi_DocuFinance', isMasked = false } = options;
  let exportData = JSON.parse(JSON.stringify(parsedData));

  if (isMasked && exportData.rows) {
    exportData.rows = exportData.rows.map(r => ({
      ...r,
      description: maskSensitiveData(r.description)
    }));
  }

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', (fileName.replace(/\.json$/i, '') || 'Banka_Ekstresi') + '.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
