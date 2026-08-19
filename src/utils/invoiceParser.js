/**
 * DocuFinance AI - GİB e-Fatura / e-Arşiv UBL-TR XML & Universal Invoice Parser
 * Parses Turkish UBL-TR 2.1 XML invoices and European Factur-X / ZUGFeRD XMLs
 */

/**
 * Parse an XML invoice string (UBL-TR / Factur-X)
 */
export function parseInvoiceXml(xmlString) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse error
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Geçersiz XML formatı');
    }

    // Helper to get element text safely
    const getTag = (tagName) => {
      const el = xmlDoc.getElementsByTagName(tagName)[0] || 
                 xmlDoc.getElementsByTagName(`cbc:${tagName}`)[0] ||
                 xmlDoc.getElementsByTagName(`cac:${tagName}`)[0];
      return el ? el.textContent.trim() : '';
    };

    // Extract core fields
    const invoiceNo = getTag('ID') || getTag('InvoiceNumber') || `FAT-${Date.now()}`;
    const issueDate = getTag('IssueDate') || new Date().toISOString().split('T')[0];
    const currency = getTag('DocumentCurrencyCode') || 'TRY';

    // Supplier Info (Satıcı)
    const supplierParty = xmlDoc.getElementsByTagName('cac:AccountingSupplierParty')[0] || 
                          xmlDoc.getElementsByTagName('AccountingSupplierParty')[0];
    
    let supplierName = 'Bilinmeyen Satıcı';
    let supplierTaxId = '';
    
    if (supplierParty) {
      const partyNameEl = supplierParty.getElementsByTagName('cbc:PartyName')[0] || 
                          supplierParty.getElementsByTagName('cbc:RegistrationName')[0] ||
                          supplierParty.getElementsByTagName('PartyName')[0];
      if (partyNameEl) supplierName = partyNameEl.textContent.trim();

      const taxSchemeEl = supplierParty.getElementsByTagName('cbc:ID')[0] || 
                          supplierParty.getElementsByTagName('ID')[0];
      if (taxSchemeEl) supplierTaxId = taxSchemeEl.textContent.trim();
    }

    // Customer Info (Alıcı)
    const customerParty = xmlDoc.getElementsByTagName('cac:AccountingCustomerParty')[0] || 
                          xmlDoc.getElementsByTagName('AccountingCustomerParty')[0];
    
    let customerName = '';
    let customerTaxId = '';
    
    if (customerParty) {
      const partyNameEl = customerParty.getElementsByTagName('cbc:PartyName')[0] || 
                          customerParty.getElementsByTagName('cbc:RegistrationName')[0] ||
                          customerParty.getElementsByTagName('PartyName')[0];
      if (partyNameEl) customerName = partyNameEl.textContent.trim();

      const taxSchemeEl = customerParty.getElementsByTagName('cbc:ID')[0] || 
                          customerParty.getElementsByTagName('ID')[0];
      if (taxSchemeEl) customerTaxId = taxSchemeEl.textContent.trim();
    }

    // Financial Totals
    const lineExtensionAmount = parseFloat(getTag('LineExtensionAmount')) || 0; // Matrah
    const taxExclusiveAmount = parseFloat(getTag('TaxExclusiveAmount')) || lineExtensionAmount;
    const taxAmount = parseFloat(getTag('TaxAmount')) || 0; // KDV
    const payableAmount = parseFloat(getTag('PayableAmount')) || (taxExclusiveAmount + taxAmount); // Genel Toplam

    // Calculate effective KDV percent
    let taxPercent = 20;
    if (taxExclusiveAmount > 0 && taxAmount > 0) {
      taxPercent = Math.round((taxAmount / taxExclusiveAmount) * 100);
    }

    return {
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      invoiceNo,
      issueDate,
      supplierName,
      supplierTaxId,
      customerName,
      customerTaxId,
      currency,
      matrah: taxExclusiveAmount,
      kdvAmount: taxAmount,
      taxPercent,
      payableAmount,
      type: 'e-fatura',
      rawSource: 'xml'
    };
  } catch (error) {
    console.error('Invoice XML parse error:', error);
    return null;
  }
}

/**
 * Format parsed invoice list into GİB İndirilecek KDV Listesi format
 */
export function formatKdvList(invoices = []) {
  return invoices.map((inv, index) => ({
    siraNo: index + 1,
    faturaTarihi: inv.issueDate,
    faturaNo: inv.invoiceNo,
    saticiVknTckn: inv.supplierTaxId || '-',
    saticiUnvan: inv.supplierName || 'Bilinmeyen Satıcı',
    malHizmetTuru: 'Genel Alım',
    matrah: inv.matrah || (inv.payableAmount - (inv.kdvAmount || 0)),
    kdvOrani: `%${inv.taxPercent || 20}`,
    indirilecekKdv: inv.kdvAmount || 0,
    toplamTutar: inv.payableAmount
  }));
}

/**
 * Format parsed invoices into Ba-Bs Reconciliation format
 */
export function formatBaBsSummary(invoices = []) {
  const map = {};

  invoices.forEach(inv => {
    const key = inv.supplierTaxId || inv.supplierName;
    if (!map[key]) {
      map[key] = {
        vknTckn: inv.supplierTaxId || '-',
        unvan: inv.supplierName,
        faturaAdedi: 0,
        toplamMatrah: 0,
        toplamKdv: 0,
        toplamTutar: 0
      };
    }

    map[key].faturaAdedi += 1;
    map[key].toplamMatrah += inv.matrah || 0;
    map[key].toplamKdv += inv.kdvAmount || 0;
    map[key].toplamTutar += inv.payableAmount || 0;
  });

  return Object.values(map);
}
