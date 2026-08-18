import * as XLSX from 'xlsx';
import { maskSensitiveData } from './security';

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

  // Prepare Transaction Rows
  const transactionRows = (parsedData.rows || []).map((row, index) => {
    let desc = row.description || '';
    if (isMasked) {
      desc = maskSensitiveData(desc);
    }

    return {
      'Sıra': index + 1,
      'İşlem Tarihi': row.date || '',
      'Açıklama / Detay': desc,
      'Kategori': row.category || 'Genel',
      'Hesap Kodu (TDHP)': row.accountCode || '',
      'Borç / Çıkan (Gider)': (row.debit > 0 ? row.debit : 0),
      'Alacak / Giren (Gelir)': (row.credit > 0 ? row.credit : 0),
      'Net Tutar': (row.credit || 0) - (row.debit || 0),
      'Kalan Bakiye': row.balance || 0
    };
  });

  const wsTransactions = XLSX.utils.json_to_sheet(transactionRows);

  wsTransactions['!cols'] = [
    { wch: 6 },   // Sıra
    { wch: 14 },  // Tarih
    { wch: 45 },  // Açıklama
    { wch: 22 },  // Kategori
    { wch: 18 },  // Hesap Kodu
    { wch: 20 },  // Borç
    { wch: 20 },  // Alacak
    { wch: 18 },  // Net Tutar
    { wch: 20 }   // Bakiye
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Hesap Hareketleri');

  if (includeAuditSheet && parsedData.meta) {
    const meta = parsedData.meta;
    const summaryData = [
      { 'Finansal Rapor Özeti': 'Banka / Kurum', 'Değer': meta.bankName || 'Bilinmiyor' },
      { 'Finansal Rapor Özeti': 'Para Birimi', 'Değer': meta.currency || currency },
      { 'Finansal Rapor Özeti': 'Toplam İşlem Adedi', 'Değer': transactionRows.length },
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
