/**
 * DocuFinance AI - GİB e-Fatura & e-Arşiv UBL-TR XML Parser
 * Parses official Turkish e-Invoices (UBL 2.1 XML) into structured financial ledger rows.
 */

export function isUBLInvoiceXML(xmlString) {
  if (!xmlString || typeof xmlString !== 'string') return false;
  return xmlString.includes('<Invoice') || xmlString.includes('<inv:Invoice') || xmlString.includes('urn:oasis:names:specification:ubl:schema:xsd:Invoice-2');
}

export function parseUBLInvoiceXML(xmlString, fileName = 'e-Fatura.xml') {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const getText = (selector, parent = xmlDoc) => {
      const el = parent.querySelector(selector);
      return el ? el.textContent.trim() : '';
    };

    const invoiceId = getText('ID') || getText('cbc\\:ID') || 'E-FATURA';
    const issueDate = getText('IssueDate') || getText('cbc\\:IssueDate') || new Date().toISOString().slice(0, 10);
    const currency = getText('DocumentCurrencyCode') || getText('cbc\\:DocumentCurrencyCode') || 'TRY';

    // Supplier Info (Satıcı)
    const supplierParty = xmlDoc.querySelector('AccountingSupplierParty') || xmlDoc.querySelector('cac\\:AccountingSupplierParty');
    let supplierName = '';
    let supplierVKN = '';
    if (supplierParty) {
      supplierName = getText('PartyName Name', supplierParty) || getText('PartyLegalEntity RegistrationName', supplierParty) || getText('Name', supplierParty) || '';
      supplierVKN = getText('PartyIdentification ID', supplierParty) || '';
    }

    // Customer Info (Alıcı)
    const customerParty = xmlDoc.querySelector('AccountingCustomerParty') || xmlDoc.querySelector('cac\\:AccountingCustomerParty');
    let customerName = '';
    let customerVKN = '';
    if (customerParty) {
      customerName = getText('PartyName Name', customerParty) || getText('PartyLegalEntity RegistrationName', customerParty) || getText('Name', customerParty) || '';
      customerVKN = getText('PartyIdentification ID', customerParty) || '';
    }

    // Monetary Totals (Tutarlar)
    const payableAmountStr = getText('PayableAmount') || getText('cbc\\:PayableAmount') || '0';
    const payableAmount = parseFloat(payableAmountStr.replace(',', '.')) || 0;

    const taxAmountStr = getText('TaxAmount') || getText('cbc\\:TaxAmount') || '0';
    const taxAmount = parseFloat(taxAmountStr.replace(',', '.')) || 0;

    const taxExclusiveStr = getText('TaxExclusiveAmount') || getText('cbc\\:TaxExclusiveAmount') || '0';
    const taxExclusiveAmount = parseFloat(taxExclusiveStr.replace(',', '.')) || (payableAmount - taxAmount);

    // Format Date (DD.MM.YYYY)
    let formattedDate = issueDate;
    if (issueDate.includes('-')) {
      const [y, m, d] = issueDate.split('-');
      formattedDate = `${d}.${m}.${y}`;
    }

    const description = `e-Fatura: ${invoiceId} | ${supplierName || 'Satıcı'} -> ${customerName || 'Alıcı'} (Matrah: ${taxExclusiveAmount.toFixed(2)}, KDV: ${taxAmount.toFixed(2)})`;

    const row = {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      date: formattedDate,
      description: description,
      category: 'e-Fatura & Gider',
      accountCode: '770.08',
      accountName: 'Fatura Giderleri ve Alışlar',
      debit: payableAmount,
      credit: 0,
      amount: -payableAmount,
      balance: 0,
      invoiceNumber: invoiceId,
      supplierName,
      supplierVKN,
      customerName,
      customerVKN,
      taxAmount,
      taxExclusiveAmount,
      isVerified: true
    };

    return {
      meta: {
        bankName: `GİB e-Fatura / e-Arşiv (${invoiceId})`,
        currency: currency,
        transactionCount: 1,
        startingBalance: 0,
        endingBalance: 0,
        calculatedEnding: -payableAmount,
        totalDebit: payableAmount,
        totalCredit: 0,
        netFlow: -payableAmount,
        discrepancy: 0,
        isReconciled: true,
        fileName: fileName,
        documentType: 'e-invoice'
      },
      rows: [row]
    };
  } catch (err) {
    console.error('Failed to parse UBL XML:', err);
    throw new Error('e-Fatura XML dosyası okunamadı. Geçerli bir GİB UBL standardında XML yükleyin.');
  }
}
