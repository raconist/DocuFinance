import * as XLSX from 'xlsx';
import { maskSensitiveData } from './security.js';

/**
 * DocuFinance AI - Universal Multi-Accounting Export Engine
 * Generates:
 * 1. Microsoft Excel (.xlsx) [With Audit Sheet]
 * 2. Luca Muhasebe (CSV)
 * 3. Zirve Muhasebe (Excel .xlsx)
 * 4. Logo Muhasebe (Excel .xlsx)
 * 5. Paraşüt / Bizmu (CSV)
 * 6. QuickBooks / Xero (.QBO / .OFX)
 * 7. Quicken / MS Money (.QIF)
 * 8. Standard UTF-8 CSV & JSON
 */

function triggerBlobDownload(blob, fullFileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fullFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 1. Standard Formatted Microsoft Excel (.xlsx)
export function exportToExcel(parsedData, options = {}) {
  const {
    fileName = 'Banka_Ekstresi_DocuFinance',
    isMasked = false,
    includeAuditSheet = true,
    currency = 'TRY'
  } = options;

  const wb = XLSX.utils.book_new();
  const rows = parsedData.rows || [];
  const meta = parsedData.meta || {};

  // Calculate Aggregates
  let totalDebit = 0;
  let totalCredit = 0;

  rows.forEach(r => {
    totalDebit += parseFinancialNumber(r.debit);
    totalCredit += parseFinancialNumber(r.credit);
  });

  const startingBalance = parseFinancialNumber(meta.startingBalance) || 0;
  const officialEnding = parseFinancialNumber(meta.endingBalance) || 0;
  const netFlow = totalCredit - totalDebit;
  const calculatedEnding = startingBalance + netFlow;
  const endingBalance = officialEnding || calculatedEnding;
  const bankName = meta.bankName || 'Banka Ekstresi';

  // Build AOA (Array of Arrays) for Rich Sheet Structure
  const aoaData = [
    // Header Row 1: Document Metadata
    ['DocuFinance AI - Finansal Ekstre ve Hesap Hareketleri Raporu', '', '', '', '', '', '', '', ''],
    ['Banka / Kurum:', bankName, '', 'Para Birimi:', meta.currency || currency, '', 'Rapor Tarihi:', new Date().toLocaleString('tr-TR'), ''],
    [],
    // KPI Cards Block (Başlangıç, Giren, Çıkan, Net Akış, Kapanış)
    ['BAŞLANGIÇ BAKİYESİ', 'TOPLAM GİREN (+)', 'TOPLAM ÇIKAN (-)', 'NET NAKİT AKIŞI', 'KAPANIŞ BAKİYESİ', 'MUTABAKAT DURUMU', 'İŞLEM SAYISI', '', ''],
    [
      startingBalance,
      totalCredit,
      totalDebit,
      netFlow,
      endingBalance,
      meta.isReconciled ? 'TAM MUTABAKAT (%100)' : 'KONTROL EDİLMELİ',
      rows.length,
      '',
      ''
    ],
    [],
    // Table Column Headers
    [
      'Sıra',
      'İşlem Tarihi',
      'Açıklama / Detay',
      'Kategori',
      'Hesap Kodu (TDHP)',
      'Borç / Çıkan (Gider)',
      'Alacak / Giren (Gelir)',
      'Net Tutar',
      'Kalan Bakiye'
    ]
  ];

  // Append Individual Transactions
  rows.forEach((row, index) => {
    let desc = row.description || '';
    if (isMasked) {
      desc = maskSensitiveData(desc);
    }

    const rowDebit = parseFinancialNumber(row.debit);
    const rowCredit = parseFinancialNumber(row.credit);
    const rowBalance = parseFinancialNumber(row.balance);

    aoaData.push([
      index + 1,
      row.date || '',
      desc,
      row.category || 'Genel Giderler',
      row.accountCode || (rowCredit > 0 ? '600.01' : '770.01'),
      rowDebit > 0 ? rowDebit : 0,
      rowCredit > 0 ? rowCredit : 0,
      rowCredit - rowDebit,
      rowBalance || 0
    ]);
  });

  // Append Grand Total Row at Bottom
  aoaData.push([
    'GENEL TOPLAM',
    `${rows.length} İşlem`,
    `Toplam Giren: ${totalCredit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} | Toplam Çıkan: ${totalDebit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
    'GENEL',
    '',
    totalDebit,
    totalCredit,
    netFlow,
    endingBalance
  ]);

  const wsTransactions = XLSX.utils.aoa_to_sheet(aoaData);

  wsTransactions['!cols'] = [
    { wch: 8 },   // Sıra
    { wch: 15 },  // Tarih
    { wch: 50 },  // Açıklama
    { wch: 24 },  // Kategori
    { wch: 20 },  // Hesap Kodu
    { wch: 22 },  // Borç
    { wch: 22 },  // Alacak
    { wch: 20 },  // Net Tutar
    { wch: 22 }   // Bakiye
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Hesap Hareketleri');

  // Sheet 2: Audit & Reconciliation Sheet
  if (includeAuditSheet) {
    const summaryData = [
      { 'Finansal Rapor Özeti': 'Banka / Kurum', 'Değer': bankName },
      { 'Finansal Rapor Özeti': 'Para Birimi', 'Değer': meta.currency || currency },
      { 'Finansal Rapor Özeti': 'Toplam İşlem Adedi', 'Değer': rows.length },
      { 'Finansal Rapor Özeti': 'Başlangıç Bakiyesi', 'Değer': startingBalance },
      { 'Finansal Rapor Özeti': 'Toplam Giren (+ Gelir)', 'Değer': totalCredit },
      { 'Finansal Rapor Özeti': 'Toplam Çıkan (- Gider)', 'Değer': totalDebit },
      { 'Finansal Rapor Özeti': 'Net Nakit Akışı', 'Değer': netFlow },
      { 'Finansal Rapor Özeti': 'Hesaplanan Kapanış Bakiyesi', 'Değer': calculatedEnding },
      { 'Finansal Rapor Özeti': 'Resmi Kapanış Bakiyesi', 'Değer': officialEnding },
      { 'Finansal Rapor Özeti': 'Bakiye Mutabakatı (Reconciliation)', 'Değer': meta.isReconciled ? 'TAM MUTABAKAT (%100)' : 'FARK BULUNDU' },
      { 'Finansal Rapor Özeti': 'Dönüştürme Motoru', 'Değer': 'DocuFinance AI (Zero-Knowledge)' },
      { 'Finansal Rapor Özeti': 'Rapor Oluşturma Tarihi', 'Değer': new Date().toLocaleString('tr-TR') }
    ];

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Finansal Özet & Mutabakat');
  }

  const cleanFileName = (fileName.replace(/\.xlsx$/i, '') || 'Banka_Ekstresi') + '.xlsx';
  XLSX.writeFile(wb, cleanFileName);
}

// 2. Luca Muhasebe CSV Formatı (Banka Hareketleri Şablonu)
export function exportToLucaCSV(parsedData, options = {}) {
  const { fileName = 'Luca_Banka_Aktarim', isMasked = false } = options;

  const headers = ['Tarih', 'Aciklama', 'Borc', 'Alacak', 'Bakiye', 'HesapKodu', 'EvrakNo'];
  const rows = (parsedData.rows || []).map((row, index) => {
    let desc = (row.description || '').replace(/;/g, ' ').replace(/"/g, '');
    if (isMasked) desc = maskSensitiveData(desc);

    const debit = row.debit > 0 ? row.debit.toFixed(2).replace('.', ',') : '0,00';
    const credit = row.credit > 0 ? row.credit.toFixed(2).replace('.', ',') : '0,00';
    const balance = (row.balance || 0).toFixed(2).replace('.', ',');
    const accountCode = row.accountCode || (row.credit > 0 ? '600.01' : '770.01');
    const evrakNo = `BNK-${index + 1}`;

    return [
      row.date || '',
      `"${desc}"`,
      debit,
      credit,
      balance,
      accountCode,
      evrakNo
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, (fileName.replace(/\.csv$/i, '') || 'Luca_Banka_Aktarim') + '.csv');
}

// 3. Zirve Muhasebe Banka Excel Formatı
export function exportToZirveExcel(parsedData, options = {}) {
  const { fileName = 'Zirve_Banka_Excel', isMasked = false } = options;

  const wb = XLSX.utils.book_new();
  const rows = (parsedData.rows || []).map((row, index) => {
    let desc = row.description || '';
    if (isMasked) desc = maskSensitiveData(desc);

    return {
      'Tarih': row.date || '',
      'Fiş No': index + 1,
      'Açıklama': desc,
      'Borç Tutarı': row.debit > 0 ? row.debit : '',
      'Alacak Tutarı': row.credit > 0 ? row.credit : '',
      'İşlem Tutarı': (row.credit || 0) - (row.debit || 0),
      'Bakiye': row.balance || 0,
      'Hesap Kodu': row.accountCode || (row.credit > 0 ? '600' : '770')
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 8 }, { wch: 45 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Zirve_Banka');
  XLSX.writeFile(wb, (fileName.replace(/\.xlsx$/i, '') || 'Zirve_Banka_Excel') + '.xlsx');
}

// 4. Logo Muhasebe Excel Formatı
export function exportToLogoExcel(parsedData, options = {}) {
  const { fileName = 'Logo_Banka_Aktarim', isMasked = false, currency = 'TRY' } = options;

  const wb = XLSX.utils.book_new();
  const rows = (parsedData.rows || []).map((row, index) => {
    let desc = row.description || '';
    if (isMasked) desc = maskSensitiveData(desc);

    const isCredit = (row.credit || 0) > 0;

    return {
      'Tarih': row.date || '',
      'Fiş Türü': isCredit ? 'Banka Tahsilat Fişi' : 'Banka Ödeme Fişi',
      'Hesap Kodu': row.accountCode || (isCredit ? '600.01.001' : '770.01.001'),
      'Açıklama': desc,
      'Borç': row.debit > 0 ? row.debit : 0,
      'Alacak': row.credit > 0 ? row.credit : 0,
      'Döviz Türü': currency,
      'Bakiye': row.balance || 0
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 45 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Logo_Aktarim');
  XLSX.writeFile(wb, (fileName.replace(/\.xlsx$/i, '') || 'Logo_Banka_Aktarim') + '.xlsx');
}

// 5. Paraşüt / Bizmu CSV Formatı
export function exportToParasutCSV(parsedData, options = {}) {
  const { fileName = 'Parasut_Banka_Hareketleri', isMasked = false } = options;

  const headers = ['Tarih', 'Aciklama', 'Kategori', 'Tutar', 'Bakiye', 'HesapKodu'];
  const rows = (parsedData.rows || []).map(row => {
    let desc = (row.description || '').replace(/,/g, ' ');
    if (isMasked) desc = maskSensitiveData(desc);

    const amount = (row.credit || 0) > 0 ? row.credit : -Math.abs(row.debit || 0);

    return [
      row.date || '',
      `"${desc}"`,
      `"${row.category || 'Genel'}"`,
      amount.toFixed(2),
      (row.balance || 0).toFixed(2),
      row.accountCode || ''
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, (fileName.replace(/\.csv$/i, '') || 'Parasut_Banka_Hareketleri') + '.csv');
}

// 6. QuickBooks / Xero (.QBO / .OFX) Open Financial Exchange format
export function exportToQBO(parsedData, options = {}) {
  const { fileName = 'DocuFinance_QuickBooks', isMasked = false, currency = 'USD' } = options;

  const now = new Date();
  const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  let transactionsXml = '';
  (parsedData.rows || []).forEach((row, idx) => {
    let desc = row.description || 'Transaction';
    if (isMasked) desc = maskSensitiveData(desc);
    
    // Format date YYYYMMDD
    let txDate = dateStr.slice(0, 8);
    if (row.date) {
      const parts = row.date.match(/(\d{1,4})/g);
      if (parts && parts.length >= 3) {
        if (parts[0].length === 4) {
          txDate = `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          txDate = `${parts[2]}${parts[1].padStart(2, '0')}${parts[0].padStart(2, '0')}`;
        }
      }
    }

    const isCredit = (row.credit || 0) > 0;
    const amount = isCredit ? (row.credit || 0).toFixed(2) : `-${(row.debit || 0).toFixed(2)}`;
    const trnType = isCredit ? 'CREDIT' : 'DEBIT';
    const fitId = `DOCUFIN_${idx + 1}_${Date.now()}`;

    transactionsXml += `
<STMTTRN>
<TRNTYPE>${trnType}</TRNTYPE>
<DTPOSTED>${txDate}</DTPOSTED>
<TRNAMT>${amount}</TRNAMT>
<FITID>${fitId}</FITID>
<NAME>${desc.slice(0, 32).replace(/[<>&]/g, '')}</NAME>
<MEMO>${desc.replace(/[<>&]/g, '')}</MEMO>
</STMTTRN>`;
  });

  const ofxContent = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>
<DTSERVER>${dateStr}</DTSERVER>
<LANGUAGE>ENG</LANGUAGE>
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1001</TRNUID>
<STATUS>
<CODE>0</CODE>
<SEVERITY>INFO</SEVERITY>
</STATUS>
<STMTRS>
<CURDEF>${currency}</CURDEF>
<BANKACCTFROM>
<BANKID>123456789</BANKID>
<ACCTID>987654321</ACCTID>
<ACCTTYPE>CHECKING</ACCTTYPE>
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${dateStr}</DTSTART>
<DTEND>${dateStr}</DTEND>
${transactionsXml}
</BANKTRANLIST>
<LEDGERBAL>
<BALAMT>${(parsedData.meta?.endingBalance || 0).toFixed(2)}</BALAMT>
<DTASOF>${dateStr}</DTASOF>
</LEDGERBAL>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

  const blob = new Blob([ofxContent], { type: 'application/x-ofx' });
  triggerBlobDownload(blob, (fileName.replace(/\.qbo$/i, '') || 'DocuFinance_QuickBooks') + '.qbo');
}

// 7. Quicken (.QIF) Format
export function exportToQIF(parsedData, options = {}) {
  const { fileName = 'DocuFinance_Quicken', isMasked = false } = options;

  let qifLines = ['!Type:Bank'];

  (parsedData.rows || []).forEach(row => {
    let desc = row.description || 'Transaction';
    if (isMasked) desc = maskSensitiveData(desc);

    const amount = (row.credit || 0) > 0 ? (row.credit || 0).toFixed(2) : `-${(row.debit || 0).toFixed(2)}`;

    qifLines.push(`D${row.date || ''}`);
    qifLines.push(`T${amount}`);
    qifLines.push(`P${desc}`);
    if (row.category) qifLines.push(`L${row.category}`);
    if (row.accountCode) qifLines.push(`N${row.accountCode}`);
    qifLines.push('^');
  });

  const qifContent = qifLines.join('\r\n');
  const blob = new Blob([qifContent], { type: 'application/qif' });
  triggerBlobDownload(blob, (fileName.replace(/\.qif$/i, '') || 'DocuFinance_Quicken') + '.qif');
}

// 8. Standard CSV
export function exportToCSV(parsedData, options = {}) {
  const { fileName = 'Banka_Ekstresi', isMasked = false, delimiter = ';' } = options;

  const headers = ['Sira', 'Tarih', 'Aciklama', 'Kategori', 'HesapKodu', 'Borc', 'Alacak', 'Net_Tutar', 'Bakiye'];
  const rows = (parsedData.rows || []).map((row, index) => {
    let desc = (row.description || '').replace(new RegExp(delimiter, 'g'), ' ');
    if (isMasked) desc = maskSensitiveData(desc);

    return [
      index + 1,
      `"${row.date || ''}"`,
      `"${desc}"`,
      `"${row.category || 'Genel'}"`,
      `"${row.accountCode || ''}"`,
      row.debit || 0,
      row.credit || 0,
      (row.credit || 0) - (row.debit || 0),
      row.balance || 0
    ].join(delimiter);
  });

  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerBlobDownload(blob, (fileName.replace(/\.csv$/i, '') || 'Banka_Ekstresi') + '.csv');
}

// 9. Standard JSON
export function exportToJSON(parsedData, options = {}) {
  const { fileName = 'Banka_Ekstresi', isMasked = false } = options;
  let exportData = JSON.parse(JSON.stringify(parsedData));

  if (isMasked && exportData.rows) {
    exportData.rows = exportData.rows.map(r => ({
      ...r,
      description: maskSensitiveData(r.description)
    }));
  }

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerBlobDownload(blob, (fileName.replace(/\.json$/i, '') || 'Banka_Ekstresi') + '.json');
}

// 10. German DATEV (SKR03 / SKR04 ASCII Buchungsstapel)
export function exportToDatevCSV(parsedData, options = {}) {
  const { fileName = 'DATEV_Buchungsstapel', isMasked = false } = options;

  const headerDatev = 'EXTF;700;21;Buchungsstapel;1;;;DocuFinance AI;';
  const colHeaders = 'Umsatz (ohne Soll/Haben-Kz);Soll/Haben-Kennzeichen;WKZ;Kurs;Basis-Umsatz;WKZ Basis-Umsatz;Konto;Gegenkonto;BU-Schlüssel;Belegdatum;Belegfeld 1;Belegfeld 2;Skonto;Buchungstext';

  const rows = (parsedData.rows || []).map(row => {
    let desc = row.description || '';
    if (isMasked) desc = maskSensitiveData(desc);

    const isCredit = (row.credit || 0) > 0;
    const amount = isCredit ? (row.credit || 0) : (row.debit || 0);
    const shKz = isCredit ? 'H' : 'S';
    const konto = row.accountCode || (isCredit ? '8400' : '4900');
    const gegenkonto = '1200'; // Bank
    const dateFormatted = (row.date || '').replace(/[^0-9]/g, '').slice(0, 4); // TTMM

    return [
      amount.toFixed(2).replace('.', ','),
      shKz,
      'EUR',
      '',
      '',
      '',
      konto,
      gegenkonto,
      '',
      dateFormatted,
      'DocuFinance',
      '',
      '',
      `"${desc.replace(/"/g, '""').slice(0, 60)}"`
    ].join(';');
  });

  const content = [headerDatev, colHeaders, ...rows].join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=windows-1252;' });
  triggerBlobDownload(blob, (fileName.replace(/\.csv$/i, '') || 'DATEV_Buchungen') + '.csv');
}

// 11. Multi-Tab Consolidated Annual Ledger (.xlsx)
export function exportConsolidatedAnnualLedger(parsedData, options = {}) {
  const { fileName = 'Konsolide_Yillik_Mizan_2026', isMasked = false, currency = 'TRY' } = options;
  const wb = XLSX.utils.book_new();

  // Tab 1: All Transactions
  const allRows = (parsedData.rows || []).map((r, idx) => ({
    'Sıra': idx + 1,
    'Tarih': r.date || '',
    'Kaynak Belge / Banka': r.sourceFile || parsedData.meta?.bankName || 'Banka',
    'Açıklama': isMasked ? maskSensitiveData(r.description) : (r.description || ''),
    'Kategori': r.category || 'Genel',
    'Hesap Kodu': r.accountCode || '',
    'Borç (Çıkan)': r.debit || 0,
    'Alacak (Giren)': r.credit || 0,
    'Net Tutar': (r.credit || 0) - (r.debit || 0),
    'Bakiye': r.balance || 0
  }));
  const ws1 = XLSX.utils.json_to_sheet(allRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Konsolide Ekstre');

  // Tab 2: Monthly Summary Matrix
  const monthlySummary = {};
  (parsedData.rows || []).forEach(r => {
    const d = r.date || '';
    const m = d.length >= 7 ? d.slice(0, 7) : 'Genel';
    if (!monthlySummary[m]) {
      monthlySummary[m] = { 'Dönem (Ay)': m, 'Toplam Giren (Gelir)': 0, 'Toplam Çıkan (Gider)': 0, 'Net Nakit Akışı': 0, 'İşlem Sayısı': 0 };
    }
    monthlySummary[m]['Toplam Giren (Gelir)'] += (r.credit || 0);
    monthlySummary[m]['Toplam Çıkan (Gider)'] += (r.debit || 0);
    monthlySummary[m]['Net Nakit Akışı'] += ((r.credit || 0) - (r.debit || 0));
    monthlySummary[m]['İşlem Sayısı'] += 1;
  });
  const ws2 = XLSX.utils.json_to_sheet(Object.values(monthlySummary));
  XLSX.utils.book_append_sheet(wb, ws2, 'Aylık Gelir-Gider Mizanı');

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
