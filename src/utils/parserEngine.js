/**
 * DocuFinance AI - Smart Multi-Bank & Invoice Parsing Engine
 * Supports 40+ Turkish, US, British, French, Italian, German, Spanish, Swiss, and Global FinTech Bank Formats.
 */

// Helper to normalize Turkish, British, French, Italian and European number formats
export function parseFinancialNumber(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  let str = String(val).trim();
  if (!str) return 0;

  // Remove currency signs, letters, and spaces
  str = str.replace(/[₺$€£TLUSDGBPCHF\s]/gi, '');

  const isNegative = str.startsWith('-') || str.endsWith('-') || (str.startsWith('(') && str.endsWith(')'));
  str = str.replace(/[()\-+]/g, '').trim();

  // If format is 1.234,56 (European / Turkish / French / Italian)
  if (str.includes('.') && str.includes(',')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length === 2 && parts[1].length <= 3) {
      str = str.replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  }

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isNegative ? -Math.abs(num) : Math.abs(num);
}

// Format numbers nicely to currency string
export function formatCurrency(amount, currency = 'TRY', locale = 'tr-TR') {
  try {
    let loc = 'tr-TR';
    if (currency === 'USD') loc = 'en-US';
    else if (currency === 'EUR') loc = 'de-DE';
    else if (currency === 'GBP') loc = 'en-GB';
    else if (currency === 'CHF') loc = 'de-CH';

    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

// Auto-detect bank or document type from text content
export function detectBankType(text) {
  const t = text.toUpperCase();

  const isCard = t.includes('KREDİ KARTI') || 
                 t.includes('KREDI KARTI') || 
                 t.includes('HESAP ÖZETİ') || 
                 t.includes('HESAP OZETI') || 
                 t.includes('HESAP BILDIRIM CETVELI') || 
                 t.includes('HESAP BİLDİRİM CETVELİ') || 
                 t.includes('DÖNEM BORCU') || 
                 t.includes('DONEM BORCU') || 
                 t.includes('ASGARİ ÖDEME') || 
                 t.includes('ASGARI ODEME') || 
                 t.includes('ASGARİ TUTAR') || 
                 t.includes('KART NO') || 
                 t.includes('KART NUMARASI') || 
                 t.includes('CREDIT CARD') || 
                 t.includes('CARD STATEMENT') || 
                 t.includes('BONUS CARD') || 
                 t.includes('WORLDCARD') || 
                 t.includes('MAXIMUM KART') || 
                 t.includes('AXESS') || 
                 t.includes('CARDFINANS') || 
                 t.includes('BANKKART');

  let baseBank = '';

  // --- 🇹🇷 TURKEY ---
  if (t.includes('GARANTİ') || t.includes('GARANTI') || t.includes('T. GARANTI') || t.includes('BONUS')) baseBank = 'Garanti BBVA';
  else if (t.includes('TÜRKİYE İŞ BANKASI') || t.includes('IS BANKASI') || t.includes('İŞ BANKASI') || t.includes('MAXIMUM')) baseBank = 'Türkiye İş Bankası';
  else if (t.includes('YAPI VE KREDİ') || t.includes('YAPI KREDI') || t.includes('YAPİKREDİ') || t.includes('WORLDCARD')) baseBank = 'Yapı Kredi';
  else if (t.includes('AKBANK') || t.includes('AXESS') || t.includes('WINGS')) baseBank = 'Akbank';
  else if (t.includes('ZİRAAT BANKASI') || t.includes('ZIRAAT') || t.includes('BANKKART')) baseBank = 'Ziraat Bankası';
  else if (t.includes('ENPARA.COM') || t.includes('ENPARA')) baseBank = 'Enpara.com';
  else if (t.includes('QNB FİNANSBANK') || t.includes('QNB FINANSBANK') || t.includes('CARDFINANS')) baseBank = 'QNB Finansbank';
  else if (t.includes('VAKIFBANK') || t.includes('VAKIF BANK')) baseBank = 'VakıfBank';
  else if (t.includes('HALKBANK') || t.includes('HALK BANKASI') || t.includes('PARAF')) baseBank = 'Halkbank';
  else if (t.includes('PAPARA')) baseBank = 'Papara';
  else if (t.includes('DENİZBANK') || t.includes('DENIZBANK')) baseBank = 'DenizBank';

  // --- 🇬🇧 UNITED KINGDOM (BRITISH BANKS) ---
  else if (t.includes('BARCLAYS')) baseBank = 'Barclays Bank UK';
  else if (t.includes('HSBC')) baseBank = 'HSBC UK';
  else if (t.includes('LLOYDS') || t.includes('LLOYDS BANK')) baseBank = 'Lloyds Bank';
  else if (t.includes('NATWEST') || t.includes('NATIONAL WESTMINSTER')) baseBank = 'NatWest Commercial';
  else if (t.includes('MONZO')) baseBank = 'Monzo Bank';
  else if (t.includes('STARLING')) baseBank = 'Starling Bank';
  else if (t.includes('STANDARD CHARTERED')) baseBank = 'Standard Chartered';

  // --- 🇫🇷 FRANCE (FRENCH BANKS) ---
  else if (t.includes('BNP PARIBAS') || t.includes('BNP')) baseBank = 'BNP Paribas';
  else if (t.includes('SOCIETE GENERALE') || t.includes('SOCIÉTÉ GÉNÉRALE') || t.includes('SOCGEN')) baseBank = 'Société Générale';
  else if (t.includes('CREDIT AGRICOLE') || t.includes('CRÉDIT AGRICOLE')) baseBank = 'Crédit Agricole';
  else if (t.includes('BPCE') || t.includes('BANQUE POPULAIRE') || t.includes('CAISSE D\'EPARGNE')) baseBank = 'Groupe BPCE';
  else if (t.includes('QONTO')) baseBank = 'Qonto Business';
  else if (t.includes('BOURSORAMA')) baseBank = 'Boursorama Banque';

  // --- 🇮🇹 ITALY (ITALIAN BANKS) ---
  else if (t.includes('INTESA SANPAOLO') || t.includes('SANPAOLO')) baseBank = 'Intesa Sanpaolo';
  else if (t.includes('UNICREDIT') || t.includes('UNI CREDIT')) baseBank = 'UniCredit Bank';
  else if (t.includes('BANCO BPM') || t.includes('BPM')) baseBank = 'Banco BPM';
  else if (t.includes('FINECO') || t.includes('FINECOBANK')) baseBank = 'FinecoBank';
  else if (t.includes('MONTE DEI PASCHI') || t.includes('MPS')) baseBank = 'Banca Monte dei Paschi';
  else if (t.includes('BANCOPOSTA') || t.includes('POSTE ITALIANE')) baseBank = 'Poste Italiane (BancoPosta)';

  // --- 🇩🇪 GERMANY & 🇨🇭 SWITZERLAND & 🇪🇸 SPAIN ---
  else if (t.includes('DEUTSCHE BANK')) baseBank = 'Deutsche Bank';
  else if (t.includes('COMMERZBANK')) baseBank = 'Commerzbank';
  else if (t.includes('UBS')) baseBank = 'UBS Switzerland';
  else if (t.includes('CREDIT SUISSE')) baseBank = 'Credit Suisse';
  else if (t.includes('SANTANDER')) baseBank = 'Banco Santander';
  else if (t.includes('BBVA')) baseBank = 'BBVA';
  else if (t.includes('ING') || t.includes('ING DIBA')) baseBank = 'ING Bank';
  else if (t.includes('N26')) baseBank = 'N26 Bank';

  // --- 🇺🇸 USA ---
  else if (t.includes('CHASE') || t.includes('JPMORGAN CHASE')) baseBank = 'JPMorgan Chase';
  else if (t.includes('BANK OF AMERICA') || t.includes('BOA')) baseBank = 'Bank of America';
  else if (t.includes('WELLS FARGO')) baseBank = 'Wells Fargo';
  else if (t.includes('CITIBANK') || t.includes('CITI')) baseBank = 'Citibank';
  else if (t.includes('CAPITAL ONE')) baseBank = 'Capital One';
  else if (t.includes('MERCURY')) baseBank = 'Mercury Bank';

  // --- 🌐 GLOBAL FINTECH & E-COMMERCE ---
  else if (t.includes('REVOLUT')) baseBank = 'Revolut';
  else if (t.includes('WISE') || t.includes('TRANSFERWISE')) baseBank = 'Wise Payments';
  else if (t.includes('STRIPE')) baseBank = 'Stripe Payouts';
  else if (t.includes('PAYPAL')) baseBank = 'PayPal';
  else if (t.includes('SHOPIFY')) baseBank = 'Shopify Balance';
  else if (t.includes('E-FATURA') || t.includes('E-ARŞİV') || t.includes('FATURA NO') || t.includes('INVOICE') || t.includes('RECHNUNG') || t.includes('FACTURE') || t.includes('FATTURA')) return 'E-Fatura / Fatura';

  if (isCard) {
    return baseBank ? `${baseBank} Kredi Kartı Ekstresi` : 'Kredi Kartı Hesap Özeti';
  }

  return baseBank || 'Genel Finansal Ekstre';
}

// Auto-detect primary currency from text
export function detectCurrency(text) {
  const t = text.toUpperCase();
  if (t.includes('USD') || t.includes('$') || t.includes('DOLLAR')) return 'USD';
  if (t.includes('EUR') || t.includes('€') || t.includes('EURO')) return 'EUR';
  if (t.includes('GBP') || t.includes('£') || t.includes('STERLİN') || t.includes('POUND')) return 'GBP';
  if (t.includes('CHF') || t.includes('FRANC')) return 'CHF';
  return 'TRY';
}

/**
 * Intelligent Multi-Bank & Credit Card Statement Parser
 */
export function parseFinancialContent(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Ayrıştırılacak metin veya belge bulunamadı.');
  }

  const bankName = detectBankType(rawText);
  const currency = detectCurrency(rawText);
  const upperRaw = rawText.toUpperCase();

  // Detect if this document is a Credit Card Statement
  const isCreditCard = upperRaw.includes('KREDİ KARTI') || 
                       upperRaw.includes('KREDI KARTI') || 
                       upperRaw.includes('HESAP ÖZETİ') || 
                       upperRaw.includes('HESAP OZETI') || 
                       upperRaw.includes('HESAP BILDIRIM') || 
                       upperRaw.includes('HESAP BİLDİRİM') || 
                       upperRaw.includes('DÖNEM BORCU') || 
                       upperRaw.includes('DONEM BORCU') || 
                       upperRaw.includes('ASGARİ ÖDEME') || 
                       upperRaw.includes('ASGARI ODEME') || 
                       upperRaw.includes('ASGARİ TUTAR') || 
                       upperRaw.includes('SON ÖDEME') || 
                       upperRaw.includes('SON ODEME') || 
                       upperRaw.includes('CREDIT CARD') || 
                       upperRaw.includes('CARD STATEMENT') || 
                       upperRaw.includes('KART NO') || 
                       upperRaw.includes('KART HAREKET') ||
                       upperRaw.includes('WORLDCARD') || 
                       upperRaw.includes('BONUS') || 
                       upperRaw.includes('AXESS') || 
                       upperRaw.includes('MAXIMUM KART') || 
                       upperRaw.includes('CARDFINANS') || 
                       upperRaw.includes('BANKKART');

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const transactions = [];
  let startingBalance = null;
  let endingBalance = null;

  // Regex patterns for dates (DD.MM.YYYY, MM/DD/YYYY, YYYY-MM-DD, DD/MM/YYYY)
  const dateRegex = /\b(\d{2}[./-]\d{2}[./-]\d{4}|\d{4}[./-]\d{2}[./-]\d{2}|\d{2}\s+[A-Za-z]{3}\s+\d{4})\b/;
  const amountPattern = /[-+]?\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})\b/g;

  // Scan lines for balances & header info
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();

    // Check for Devir/Açılış/Önceki Bakiye in headers
    if (startingBalance === null && (
      upperLine.includes('DEVREDEN') || 
      upperLine.includes('ÖNCEKİ BAKİYE') || 
      upperLine.includes('ONCEKI BAKIYE') || 
      upperLine.includes('ÖNCEKİ DÖNEM BORCU') || 
      upperLine.includes('ONCEKI DONEM BORCU') || 
      upperLine.includes('STARTING BALANCE') || 
      upperLine.includes('OPENING BALANCE') || 
      upperLine.includes('PREVIOUS BALANCE') || 
      upperLine.includes('ANFANGSSALDO') || 
      upperLine.includes('SOLDE INITIAL') || 
      upperLine.includes('BAŞLANGIÇ BAKİYESİ')
    )) {
      const amounts = line.match(amountPattern);
      if (amounts && amounts.length > 0) {
        startingBalance = parseFinancialNumber(amounts[amounts.length - 1]);
      }
    }

    // Check for Kapanış/Bitiş/Dönem Borcu
    if (
      upperLine.includes('DÖNEM BORCU') || 
      upperLine.includes('DONEM BORCU') || 
      upperLine.includes('TOPLAM BORÇ') || 
      upperLine.includes('EKSTRE BORCU') || 
      upperLine.includes('ÖDENECEK TUTAR') || 
      upperLine.includes('KAPANIŞ BAKİYESİ') || 
      upperLine.includes('ENDING BALANCE') || 
      upperLine.includes('GÜNCEL BAKİYE') || 
      upperLine.includes('CLOSING BALANCE') || 
      upperLine.includes('ENDSALDO') || 
      upperLine.includes('NEW BALANCE')
    ) {
      const amounts = line.match(amountPattern);
      if (amounts && amounts.length > 0) {
        endingBalance = parseFinancialNumber(amounts[amounts.length - 1]);
      }
    }

    // Look for transactions (lines containing a valid date)
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    // Filter out Summary / Meta / Header lines in Credit Card & Bank Statements
    // (e.g. "Son Ödeme Tarihi", "Hesap Kesim Tarihi", "Dönem Borcu", "Asgari Ödeme", "Limit")
    if (
      upperLine.includes('SON ÖDEME') || 
      upperLine.includes('SON ODEME') || 
      upperLine.includes('ÖEME ARII') || 
      upperLine.includes('ÖDEME TARİH') || 
      upperLine.includes('ODEME TARIH') || 
      upperLine.includes('HESAP KESİM') || 
      upperLine.includes('HESAP KESIM') || 
      upperLine.includes('DÖNEM BORCU') || 
      upperLine.includes('DONEM BORCU') || 
      upperLine.includes('ASGARİ ÖDEME') || 
      upperLine.includes('ASGARI ODEME') || 
      upperLine.includes('ASGARİ TUTAR') || 
      upperLine.includes('ASGARI TUTAR') || 
      upperLine.includes('TOPLAM BORÇ') || 
      upperLine.includes('TOPLAM BORC') || 
      upperLine.includes('KULLANILABİLİR') || 
      upperLine.includes('KULLANILABILIR') || 
      upperLine.includes('KART LİMİT') || 
      upperLine.includes('KART LIMIT') || 
      upperLine.includes('TOPLAM LİMİT') || 
      upperLine.includes('TOPLAM LIMIT') || 
      upperLine.includes('DEVREDEN BAKİYE') || 
      upperLine.includes('ÖNCEKİ DÖNEM') || 
      upperLine.includes('ONCEKI DONEM') || 
      upperLine.includes('PUAN BİLGİ') || 
      upperLine.includes('PUAN BILGI') || 
      upperLine.includes('KAZANILAN PUAN')
    ) {
      continue;
    }

    const dateStr = dateMatch[1];
    let afterDate = line.substring(line.indexOf(dateStr) + dateStr.length).trim();

    // Extract amounts from line
    const amounts = afterDate.match(amountPattern);
    if (!amounts || amounts.length === 0) continue;

    let debit = 0;
    let credit = 0;
    let balance = 0;

    // Check line semantic markers for Payments / Refunds vs Expenses / Purchases
    const isExplicitPaymentOrRefund = 
      upperLine.includes('KART BORÇ ÖDEME') || 
      upperLine.includes('KART BORC ODEME') || 
      upperLine.includes('HESAP BORÇ ÖDEME') || 
      upperLine.includes('HESAP BORC ODEME') || 
      upperLine.includes('OTOMATİK ÖDEME TAHSİL') || 
      upperLine.includes('OTOMATIK ODEME TAHSIL') || 
      upperLine.includes('EFT/HAVALE İLE ÖDEME') || 
      upperLine.includes('EFT ILE ODEME') || 
      upperLine.includes('HAVALE ILE ODEME') || 
      upperLine.includes('ATM\'DEN ÖDEME') || 
      upperLine.includes('ATM DEN ODEME') || 
      upperLine.includes('ŞUBEDEN ÖDEME') || 
      upperLine.includes('SUBEDEN ODEME') || 
      upperLine.includes('NAKİT ÖDEME') || 
      upperLine.includes('NAKIT ODEME') || 
      upperLine.includes('KART ÖDEMESİ') || 
      upperLine.includes('KART ODEMESI') || 
      upperLine.includes('İADE') || 
      upperLine.includes('IADE') || 
      upperLine.includes('REFUND') || 
      upperLine.includes('CASHBACK') || 
      upperLine.includes('ALACAK') || 
      upperLine.includes('TAHSİLAT') || 
      upperLine.includes('TAHSILAT') || 
      upperLine.includes('GELEN HAVALE') || 
      upperLine.includes('GELEN EFT') || 
      upperLine.includes('HAVALE GELEN') || 
      upperLine.includes('EFT GELEN') || 
      upperLine.includes('HESABA YATAN') || 
      /(?:^|\s)(\+|A|CR)(?:\s|$)/.test(upperLine) || 
      upperLine.includes(' +') || 
      upperLine.includes('+ ') || 
      upperLine.endsWith('+') || 
      upperLine.endsWith(' A') || 
      upperLine.endsWith(' CR');

    const hasBorcOrExpense = 
      upperLine.includes('BORÇ') || 
      upperLine.includes('BORC') || 
      upperLine.includes('HARCAMA') || 
      upperLine.includes('SATIŞ') || 
      upperLine.includes('SATIS') || 
      upperLine.includes('POS') || 
      upperLine.includes('ALIŞVERİŞ') || 
      upperLine.includes('ALISVERIS') || 
      upperLine.includes('FAİZ') || 
      upperLine.includes('FAIZ') || 
      upperLine.includes('KOMİSYON') || 
      upperLine.includes('KOMISYON') || 
      upperLine.includes('BSMV') || 
      upperLine.includes('KKDF') || 
      upperLine.includes('AİDAT') || 
      upperLine.includes('AIDAT') || 
      upperLine.includes('ÜCRET') || 
      upperLine.includes('UCRET') || 
      upperLine.includes('MASRAF') || 
      upperLine.includes('GIDEN') || 
      /(?:^|\s)(-|-TL|B|DR)(?:\s|$)/.test(upperLine) || 
      upperLine.includes(' -') || 
      upperLine.includes('- ') || 
      upperLine.endsWith('-') || 
      upperLine.endsWith(' B') || 
      upperLine.endsWith(' DR') || 
      /MARKET|PETROL|BENZIN|SHELL|OPET|BP|TOTAL|AYGAZ|MIGROS|BIM|A101|SOK|CARREFOUR|RESTORAN|CAFE|YEMEK|STARBUCKS|TRENDYOL|HEPSIBURADA|AMAZON|N11|ZARA|LCW|BOYNER|ECZANE|HASTANE|OTEL|UBER|BITAKSI|TURKCELL|VODAFONE|TURK TELEKOM|NETFLIX|SPOTIFY|APPLE|GOOGLE|FATURA|KIRA|AIDAT|GIDER|MASRAF|POS/i.test(upperLine);

    if (amounts.length >= 3) {
      // 3 amounts: [Debit, Credit, Balance] or [Amount, Tax, Balance]
      const val1 = parseFinancialNumber(amounts[0]);
      const val2 = parseFinancialNumber(amounts[1]);
      const val3 = parseFinancialNumber(amounts[2]);

      if (val1 > 0 && val2 === 0) {
        debit = val1;
        balance = val3;
      } else if (val2 > 0 && val1 === 0) {
        credit = val2;
        balance = val3;
      } else if (val1 > 0 && val2 > 0) {
        if (isCreditCard) {
          if (isExplicitPaymentOrRefund) {
            credit = val1;
            balance = val3;
          } else {
            debit = val1;
            balance = val3;
          }
        } else {
          debit = val1;
          credit = val2;
          balance = val3;
        }
      } else {
        if (isCreditCard) {
          if (isExplicitPaymentOrRefund) credit = Math.abs(val1);
          else debit = Math.abs(val1);
        } else {
          debit = val1 < 0 ? Math.abs(val1) : (hasBorcOrExpense ? val1 : 0);
          credit = val1 > 0 ? (isExplicitPaymentOrRefund ? val1 : val1) : 0;
        }
        balance = val2 || val3;
      }
    } else if (amounts.length === 2) {
      // 2 amounts: [Amount, Balance] or [Debit, Credit]
      const val1 = parseFinancialNumber(amounts[0]);
      const val2 = parseFinancialNumber(amounts[1]);

      balance = val2;

      if (isCreditCard) {
        // In Credit Cards: Purchases are DEBIT (Harcama/Borç/Çıkan), Payments/Refunds are CREDIT (Alacak/Giren)
        if (isExplicitPaymentOrRefund || amounts[0].includes('+') || (amounts[0].includes('-') && !hasBorcOrExpense)) {
          credit = Math.abs(val1);
        } else {
          debit = Math.abs(val1);
        }
      } else {
        // Checking / Deposit bank account
        if (amounts[0].includes('-') || hasBorcOrExpense || val1 < 0) {
          debit = Math.abs(val1);
        } else if (amounts[0].includes('+') || isExplicitPaymentOrRefund) {
          credit = Math.abs(val1);
        } else {
          // Check common expense vendor names
          const isExp = /MARKET|PETROL|BENZIN|SHELL|OPET|BP|TOTAL|AYGAZ|MIGROS|BIM|A101|SOK|CARREFOUR|RESTORAN|CAFE|YEMEK|STARBUCKS|TRENDYOL|HEPSIBURADA|AMAZON|N11|ZARA|LCW|BOYNER|ECZANE|HASTANE|OTEL|UBER|BITAKSI|TURKCELL|VODAFONE|TURK TELEKOM|NETFLIX|SPOTIFY|APPLE|GOOGLE|FATURA|KIRA|AIDAT|GIDER|MASRAF|POS|EFT GIDEN|HAVALE GIDEN/i.test(upperLine);
          if (isExp) debit = Math.abs(val1);
          else credit = Math.abs(val1);
        }
      }
    } else if (amounts.length === 1) {
      // 1 single amount
      const amountVal = parseFinancialNumber(amounts[0]);

      if (isCreditCard) {
        // In Credit Card statements: All regular purchases are DEBIT (Harcama / Çıkan / Gider)
        if (isExplicitPaymentOrRefund || amounts[0].includes('+')) {
          credit = Math.abs(amountVal); // Card payment, refund, or cashback
        } else {
          debit = Math.abs(amountVal); // Card purchase / expenditure
        }
      } else {
        // Checking account
        if (amountVal < 0 || amounts[0].includes('-') || hasBorcOrExpense) {
          debit = Math.abs(amountVal);
        } else if (isExplicitPaymentOrRefund || amounts[0].includes('+')) {
          credit = Math.abs(amountVal);
        } else {
          // Detect expense by vendor / store keywords
          const isExp = /MARKET|PETROL|BENZIN|SHELL|OPET|BP|TOTAL|AYGAZ|MIGROS|BIM|A101|SOK|CARREFOUR|RESTORAN|CAFE|YEMEK|STARBUCKS|TRENDYOL|HEPSIBURADA|AMAZON|N11|ZARA|LCW|BOYNER|ECZANE|HASTANE|OTEL|UBER|BITAKSI|TURKCELL|VODAFONE|TURK TELEKOM|NETFLIX|SPOTIFY|APPLE|GOOGLE|FATURA|KIRA|AIDAT|GIDER|MASRAF|POS/i.test(upperLine);
          if (isExp) {
            debit = Math.abs(amountVal);
          } else {
            credit = Math.abs(amountVal);
          }
        }
      }
    }

    // Clean description by removing extracted amounts & markers
    let cleanDesc = afterDate;
    amounts.forEach(amt => {
      cleanDesc = cleanDesc.replace(amt, '');
    });
    cleanDesc = cleanDesc
      .replace(/[₺$€£]/g, '')
      .replace(/\b(TL|TRY|USD|EUR|GBP|CHF)\b/gi, '')
      .replace(/\s+[AB]\s*$/i, '')
      .replace(/\s+[+-]\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanDesc || cleanDesc.length < 2) {
      cleanDesc = isCreditCard ? 'Kredi Kartı Harcaması' : 'Banka Hesap Hareketi';
    }

    // Smart default TDHP code & category
    let defaultCategory = 'Genel Giderler';
    let defaultAccountCode = '770.01';

    if (credit > 0) {
      if (isCreditCard) {
        defaultCategory = 'Kredi Kartı Ödemesi / İade';
        defaultAccountCode = '102.01';
      } else {
        defaultCategory = 'Satış & Gelirler';
        defaultAccountCode = '600.01';
      }
    } else {
      if (/SHELL|OPET|BP |PETROL|BENZIN|TOTAL|AYGAZ|LUKOIL/i.test(cleanDesc)) {
        defaultCategory = 'Taşıt & Akaryakıt';
        defaultAccountCode = '770.03';
      } else if (/MIGROS|BIM |A101|SOK |CARREFOUR|METRO|YEMEK|RESTORAN|CAFE|KAHVE|STARBUCKS/i.test(cleanDesc)) {
        defaultCategory = 'Temsil, Ağırlama & Yemek';
        defaultAccountCode = '770.02';
      } else if (/TURKCELL|VODAFONE|TURK TELEKOM|TTNET|SUPERONLINE/i.test(cleanDesc)) {
        defaultCategory = 'İletişim & Haberleşme';
        defaultAccountCode = '770.04';
      } else if (/GOOGLE|AWS|MICROSOFT|APPLE|NETFLIX|SPOTIFY|ADOBE|OPENAI/i.test(cleanDesc)) {
        defaultCategory = 'Yazılım & Bulut Hizmetleri';
        defaultAccountCode = '770.07';
      } else if (/BSMV|KKDF|KOMISYON|FAIZ|AIDAT|UCRET|MASRAF/i.test(cleanDesc)) {
        defaultCategory = 'Banka Masraf & Komisyonları';
        defaultAccountCode = '770.09';
      }
    }

    transactions.push({
      id: `tx_${Date.now()}_${transactions.length + 1}`,
      date: dateStr,
      description: cleanDesc,
      category: defaultCategory,
      accountCode: defaultAccountCode,
      debit: debit,
      credit: credit,
      amount: credit - debit,
      balance: balance,
      isVerified: true
    });
  }

  // --- 💡 SMART INVOICE & RECEIPT FALLBACK ENGINE ---
  // If no multi-column bank statement rows were found, parse as e-Arşiv / PDF Fatura / Fiş / Dekont
  if (transactions.length === 0) {
    const invoiceResult = parseInvoiceFromUnstructuredText(rawText);
    if (invoiceResult && invoiceResult.rows && invoiceResult.rows.length > 0) {
      return invoiceResult;
    }
    throw new Error('Belgede geçerli finansal işlem, banka hareketi veya fatura tutarı tespit edilemedi. Lütfen net bir PDF veya görsel yükleyiniz.');
  }

  // Calculate totals & balances
  let totalDebit = 0;
  let totalCredit = 0;
  transactions.forEach(tx => {
    totalDebit += tx.debit;
    totalCredit += tx.credit;
  });

  if (startingBalance === null) {
    if (transactions[0].balance !== 0) {
      startingBalance = transactions[0].balance - (transactions[0].credit - transactions[0].debit);
    } else {
      startingBalance = 0;
    }
  }

  const calculatedEnding = isCreditCard 
    ? (startingBalance + totalDebit - totalCredit) // For credit card debt: Previous Debt + New Purchases - Payments
    : (startingBalance + totalCredit - totalDebit); // For bank account: Starting Balance + Inflows - Outflows

  if (endingBalance === null) {
    endingBalance = transactions[transactions.length - 1].balance || calculatedEnding;
  }

  const netFlow = isCreditCard ? (totalDebit - totalCredit) : (totalCredit - totalDebit);
  const discrepancy = Math.abs(calculatedEnding - endingBalance);
  const isReconciled = discrepancy < 0.05;

  return {
    meta: {
      bankName: bankName,
      currency: currency,
      isCreditCard: isCreditCard,
      transactionCount: transactions.length,
      startingBalance: startingBalance,
      endingBalance: endingBalance,
      calculatedEnding: calculatedEnding,
      totalDebit: totalDebit,
      totalCredit: totalCredit,
      netFlow: netFlow,
      discrepancy: discrepancy,
      isReconciled: isReconciled,
      documentHash: 'DOCU_' + Date.now()
    },
    rows: transactions
  };
}

/**
 * Intelligent Invoice / Receipt / Dekont Unstructured Text Parser
 * Extracts invoice ID, date, supplier, VKN, matrah, KDV, and payable amount from any free-form PDF/Image text.
 */
export function parseInvoiceFromUnstructuredText(rawText) {
  if (!rawText || !rawText.trim()) return null;

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  const currency = detectCurrency(rawText);

  // 1. Extract Invoice Date
  let invoiceDate = new Date().toLocaleDateString('tr-TR');
  const dateRegex = /\b(\d{2}[./-]\d{2}[./-]\d{4}|\d{4}[./-]\d{2}[./-]\d{2})\b/;
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (upper.includes('TARİH') || upper.includes('TARIH') || upper.includes('DATE') || upper.includes('DÜZENLEME')) {
      const match = line.match(dateRegex);
      if (match) {
        invoiceDate = match[1];
        break;
      }
    }
  }
  if (invoiceDate === new Date().toLocaleDateString('tr-TR')) {
    const anyDateMatch = rawText.match(dateRegex);
    if (anyDateMatch) invoiceDate = anyDateMatch[1];
  }

  // 2. Extract Invoice Number / ID
  let invoiceNo = '';
  const gibIdMatch = rawText.match(/\b([A-Z]{3}\d{13})\b/);
  if (gibIdMatch) {
    invoiceNo = gibIdMatch[1];
  } else {
    const invNoRegex = /\b(?:FATURA|E-ARŞİV|E-FATURA|BELGE|INVOICE|SERİ|SIRA|NO)[\s#:.-]*([A-Z0-9-]{4,20})\b/i;
    const invMatch = rawText.match(invNoRegex);
    if (invMatch && !invMatch[1].match(/^\d{2}[./-]/)) {
      invoiceNo = invMatch[1];
    } else {
      invoiceNo = `FAT-${Date.now().toString().slice(-6)}`;
    }
  }

  // 3. Extract VKN / TCKN
  let vkn = '';
  const vknMatch = rawText.match(/\b(?:VKN|TCKN|VERGİ\s*NO|VERGI\s*NO|TAX\s*ID|T\.C\.)[\s:.-]*(\d{10,11})\b/i);
  if (vknMatch) {
    vkn = vknMatch[1];
  }

  // 4. Extract Supplier / Company Name
  let supplierName = '';
  for (const line of lines.slice(0, 15)) {
    const upper = line.toUpperCase();
    if (
      upper.includes('A.Ş.') || 
      upper.includes('A.S.') || 
      upper.includes('LTD.') || 
      upper.includes('ŞTİ') || 
      upper.includes('STI') || 
      upper.includes('TİC.') || 
      upper.includes('SAN.') || 
      upper.includes('PAZARLAMA') || 
      upper.includes('HİZMETLERİ') ||
      upper.includes('GMBH') ||
      upper.includes('INC') ||
      upper.includes('LLC')
    ) {
      supplierName = line.replace(/^(SATICI|GÖNDEREN|FİRMA|UNVAN)[:\s-]*/i, '').trim();
      break;
    }
  }
  if (!supplierName) {
    supplierName = lines[0]?.length < 50 ? lines[0] : 'Ticari Fatura / Satıcı';
  }

  // 5. Extract Financial Amounts (Matrah, KDV, Ödenecek Tutar)
  const amountPattern = /[-+]?\b\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})\b/g;
  let payableAmount = 0;
  let taxAmount = 0;
  let matrah = 0;

  for (const line of lines) {
    const upper = line.toUpperCase();
    const amounts = line.match(amountPattern);
    if (!amounts || amounts.length === 0) continue;

    const lastVal = parseFinancialNumber(amounts[amounts.length - 1]);

    if (
      upper.includes('ÖDENECEK') || 
      upper.includes('ODENECEK') || 
      upper.includes('GENEL TOPLAM') || 
      upper.includes('TOPLAM TUTAR') || 
      upper.includes('VERGİLER DAHİL') || 
      upper.includes('TOTAL AMOUNT') || 
      upper.includes('TOTAL PAYABLE')
    ) {
      if (lastVal > 0) payableAmount = lastVal;
    } else if (
      upper.includes('HESAPLANAN KDV') || 
      upper.includes('KDV TUTARI') || 
      upper.includes('TOPLAM KDV') || 
      upper.includes('KDV (%') || 
      upper.includes('VAT AMOUNT')
    ) {
      if (lastVal > 0) taxAmount = lastVal;
    } else if (
      upper.includes('MATRAH') || 
      upper.includes('MAL HİZMET TOPLAM') || 
      upper.includes('ARA TOPLAM') || 
      upper.includes('SUBTOTAL') || 
      upper.includes('VERGİ HARİÇ')
    ) {
      if (lastVal > 0) matrah = lastVal;
    }
  }

  // Fallback: If payableAmount is still 0, find the highest positive amount in the document
  if (payableAmount === 0) {
    const allAmounts = (rawText.match(amountPattern) || []).map(parseFinancialNumber).filter(n => n > 0);
    if (allAmounts.length > 0) {
      payableAmount = Math.max(...allAmounts);
    }
  }

  if (payableAmount === 0) return null;

  if (matrah === 0 && taxAmount > 0) {
    matrah = Math.max(0, payableAmount - taxAmount);
  } else if (matrah === 0 && taxAmount === 0) {
    // Standard %20 KDV assumption
    matrah = +(payableAmount / 1.20).toFixed(2);
    taxAmount = +(payableAmount - matrah).toFixed(2);
  }

  const description = `Fatura: ${invoiceNo} | ${supplierName} (Matrah: ${matrah.toFixed(2)}, KDV: ${taxAmount.toFixed(2)}${vkn ? `, VKN: ${vkn}` : ''})`;

  const invoiceRow = {
    id: `inv_${Date.now()}_1`,
    date: invoiceDate,
    description: description,
    category: 'Fatura & Hizmet Alımı',
    accountCode: '770.08',
    accountName: 'Fatura Giderleri ve Alışlar',
    debit: payableAmount,
    credit: 0,
    amount: -payableAmount,
    balance: 0,
    invoiceNumber: invoiceNo,
    supplierName: supplierName,
    supplierVKN: vkn,
    taxAmount: taxAmount,
    taxExclusiveAmount: matrah,
    isVerified: true
  };

  return {
    meta: {
      bankName: `e-Fatura / Fatura (${invoiceNo})`,
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
      documentHash: 'DOCU_INV_' + Date.now(),
      documentType: 'invoice'
    },
    rows: [invoiceRow]
  };
}

// -------------------------------------------------------------
// EXPANDED REALISTIC MULTI-COUNTRY SAMPLE STATEMENTS
// -------------------------------------------------------------
export const SAMPLE_STATEMENTS = {
  // --- 🇹🇷 TÜRKİYE ---
  garanti: {
    name: 'Garanti BBVA Kurumsal Ekstre',
    bank: 'Garanti BBVA',
    region: 'TR',
    currency: 'TRY',
    text: `T. GARANTİ BANKASI A.Ş. HESAP EKSTRESİ
Hesap No: 6298104 - TR45 0006 2000 0001 2345 6789 01
Devreden Bakiye: 45.250,00 TL

Tarih        Açıklama                              Borç         Alacak       Bakiye
01.08.2026   GELEN EFT - ACME YAZILIM A.Ş.                      35.000,00   80.250,00
02.08.2026   SHELL AKARYAKIT VE OTOMOTİV A.Ş.       1.450,00                78.800,00
04.08.2026   OFİS KİRASI - PLAZA YÖNETİMİ          12.000,00                66.800,00
06.08.2026   YEMEKSEPETİ GIDA VE RESTORAN HARCAMASI   340,00                66.460,00
08.08.2026   GELEN FAST - FREELANCE DANIŞMANLIK                 8.500,00    74.960,00
10.08.2026   AMAZON WEB SERVICES BULUT SUNUCU GİDERİ  2.850,00              72.110,00
12.08.2026   GİB VERGİ VE SGK PRİM ÖDEMESİ          8.200,00                63.910,00
14.08.2026   MİGROS TİCARET OFİS MUTFAK ALIŞVERİŞİ    620,00                63.290,00
15.08.2026   PERSONEL MAAŞ VE AVANS ÖDEMESİ        28.500,00                34.790,00

Kapanış Bakiyesi: 34.790,00 TL`
  },

  isbankasi: {
    name: 'Türkiye İş Bankası Şirket Hesabı',
    bank: 'Türkiye İş Bankası',
    region: 'TR',
    currency: 'TRY',
    text: `TÜRKİYE İŞ BANKASI A.Ş. - HESAP HAREKETLERİ DÖKÜMÜ
Başlangıç Bakiyesi: 120.000,00 TL

Tarih       İşlem Tanımı                                Borç         Alacak       Bakiye
03.08.2026  GELEN EFT - STRATEJİK PAZARLAMA DANIŞMANLIĞI              50.000,00   170.000,00
05.08.2026  PERSONEL PRİM VE YOL ÜCRETİ ÖDEMESİ        15.200,00                 154.800,00
07.08.2026  AMAZON WEB SERVICES SUNUCU FATURASI         4.800,00                 150.000,00
09.08.2026  YURT DIŞI SAAS YAZILIM GELİRLERİ (STRIPE)                 62.500,00   212.500,00
11.08.2026  HUKUK VE AVUKATLIK DANIŞMANLIK BEDELİ       7.500,00                 205.000,00
13.08.2026  SGK VE BAĞ-KUR AĞUSTOS DÖNEMİ PRİM ÖDEMESİ 22.400,00                 182.600,00
15.08.2026  GELEN FAST - YAZILIM LİSANS SATIŞ BEDELİ                  14.400,00   197.000,00

Kapanış Bakiyesi: 197.000,00 TL`
  },

  akbank: {
    name: 'Akbank Ticari Kurumsal Hesap',
    bank: 'Akbank',
    region: 'TR',
    currency: 'TRY',
    text: `AKBANK T.A.Ş. - HESAP HAREKETLERİ EKSTRESİ
Hesap No: 489-0194820 | Para Birimi: TRY
Açılış Bakiyesi: 85.000,00 TL

Tarih       Açıklama                                    Borç         Alacak       Bakiye
02.08.2026  GELEN HAVALE - DİJİTAL REKLAM HİZMET BEDELİ               45.000,00   130.000,00
04.08.2026  OPET AKARYAKIT İSTASYONLARI A.Ş.            2.150,00                 127.850,00
08.08.2026  GOOGLE CLOUD EMEA FATURA ÖDEMESİ            3.600,00                 124.250,00
12.08.2026  YAZILIM DANIŞMANLIK HAKEDİŞ BEDELİ                        28.000,00   152.250,00
15.08.2026  PERSONEL MAAŞ VE YOL ÜCRETİ ÖDEMESİ        32.000,00                 120.250,00

Kapanış Bakiyesi: 120.250,00 TL`
  },

  yapikredi: {
    name: 'Yapı Kredi Ticari Cari Hesap',
    bank: 'Yapı Kredi',
    region: 'TR',
    currency: 'TRY',
    text: `YAPI VE KREDİ BANKASI A.Ş. EKSTRE
Devreden Bakiye: 54.000,00 TL

Tarih        Açıklama                                 Borç         Alacak       Bakiye
01.08.2026   GELEN FAST - E-TİCARET PAZARYERİ GELİRİ               38.500,00    92.500,00
05.08.2026   TÜRK TELEKOM KURUMSAL FİBER İNTERNET       1.250,00                91.250,00
09.08.2026   AĞUSTOS AYI OFİS KİRASI VE STOPAJ BEDELİ  15.000,00                76.250,00
14.08.2026   KURUMSAL YAZILIM LİSANS SATIŞ GELİRİ                  22.000,00    98.250,00

Güncel Bakiye: 98.250,00 TL`
  },

  ziraat: {
    name: 'Ziraat Bankası Kurumsal Hesap',
    bank: 'Ziraat Bankası',
    region: 'TR',
    currency: 'TRY',
    text: `T.C. ZİRAAT BANKASI A.Ş. HESAP EKSTRESİ
Başlangıç Bakiyesi: 60.000,00 TL

Tarih       İşlem Açıklaması                            Borç         Alacak       Bakiye
03.08.2026  GELEN EFT - KAMU PROJE HAKEDİŞ BEDELİ                     55.000,00   115.000,00
07.08.2026  GİB VERGİ DAİRESİ KDV VE MUHTASAR ÖDEMESİ  18.400,00                  96.600,00
11.08.2026  NOTER ONAY VE RESMİ HARÇ GİDERLERİ          1.800,00                  94.800,00
15.08.2026  GELEN HAVALE - DANIŞMANLIK HİZMET BEDELİ                  30.000,00   124.800,00

Kapanış Bakiyesi: 124.800,00 TL`
  },

  enpara: {
    name: 'Enpara.com Şirketim Hesabı',
    bank: 'Enpara.com',
    region: 'TR',
    currency: 'TRY',
    text: `ENPARA.COM ŞİRKETİM GÜNLÜK HAREKET DÖKÜMÜ
Başlangıç Bakiyesi: 32.400,00 TL

Tarih       Açıklama                                    Borç         Alacak       Bakiye
02.08.2026  GELEN FAST - YAZILIM ENTEGRASYON BEDELİ                   16.500,00    48.900,00
06.08.2026  GITHUB VE FIGMA KURUMSAL YAZILIM GİDERİ     1.100,00                  47.800,00
10.08.2026  MÜŞTERİ YEMEK VE AĞIRLAMA GİDERİ             680,00                  47.120,00
14.08.2026  MALİ MÜŞAVİRLİK HİZMET BEDELİ TAHSİLATI                   12.000,00    59.120,00

Kapanış Bakiyesi: 59.120,00 TL`
  },

  qnb: {
    name: 'QNB Finansbank Ticari Ekstre',
    bank: 'QNB Finansbank',
    region: 'TR',
    currency: 'TRY',
    text: `QNB FİNANSBANK A.Ş. HESAP EKSTRESİ
Devreden Bakiye: 40.000,00 TL

Tarih       Açıklama                                    Borç         Alacak       Bakiye
04.08.2026  GELEN EFT - İHRACAT DANIŞMANLIK GELİRİ                    42.000,00    82.000,00
08.08.2026  OFİS ELEKTRİK VE DOĞALGAZ FATURA ÖDEMESİ    2.400,00                  79.600,00
12.08.2026  YURT DIŞI ÖDEME ALTYAPISI TAHSİLATI                       25.000,00   104.600,00

Kapanış Bakiyesi: 104.600,00 TL`
  },

  vakifbank: {
    name: 'VakıfBank Kurumsal Ekstre',
    bank: 'VakıfBank',
    region: 'TR',
    currency: 'TRY',
    text: `TÜRKİYE VAKIFLAR BANKASI T.A.O. EKSTRE
Başlangıç Bakiyesi: 50.000,00 TL

Tarih       İşlem Açıklaması                            Borç         Alacak       Bakiye
02.08.2026  GELEN EFT - YAZILIM GELİŞTİRME BEDELİ                     35.000,00    85.000,00
06.08.2026  SGK VE İŞVEREN PRİM ÖDEMESİ                14.500,00                  70.500,00
10.08.2026  DANIŞMANLIK HİZMETİ HAKEDİŞ TAHSİLATI                     18.000,00    88.500,00

Kapanış Bakiyesi: 88.500,00 TL`
  },

  denizbank: {
    name: 'DenizBank Ticari Hesap',
    bank: 'DenizBank',
    region: 'TR',
    currency: 'TRY',
    text: `DENİZBANK A.Ş. HESAP EKSTRESİ
Devreden Bakiye: 38.000,00 TL

Tarih       Açıklama                                    Borç         Alacak       Bakiye
03.08.2026  GELEN HAVALE - DİJİTAL REKLAM BEDELİ                      26.000,00    64.000,00
07.08.2026  ŞİRKET ARACI AKARYAKIT GİDERİ               1.950,00                  62.050,00
11.08.2026  YAZILIM BAKIM VE DESTEK TAHSİLATI                         15.000,00    77.050,00

Kapanış Bakiyesi: 77.050,00 TL`
  },

  kuveytturk: {
    name: 'Kuveyt Türk Katılım Hesabı',
    bank: 'Kuveyt Türk',
    region: 'TR',
    currency: 'TRY',
    text: `KUVEYT TÜRK KATILIM BANKASI A.Ş. CARİ EKSTRE
Açılış Bakiyesi: 45.000,00 TL

Tarih       Açıklama                                    Borç         Alacak       Bakiye
01.08.2026  GELEN FAST - MAL VE HİZMET SATIŞ BEDELİ                   30.000,00    75.000,00
05.08.2026  İŞ YERİ KİRA VE BİNA AİDAT ÖDEMESİ         10.000,00                  65.000,00
09.08.2026  DİJİTAL AJANS HİZMET BEDELİ TAHSİLATI                     19.500,00    84.500,00

Kapanış Bakiyesi: 84.500,00 TL`
  },

  halkbank: {
    name: 'Türkiye Halk Bankası Kurumsal Hesap',
    bank: 'Halkbank',
    region: 'TR',
    currency: 'TRY',
    text: `TÜRKİYE HALK BANKASI A.Ş. HESAP ÖZETİ
Hesap Adı: TİCARİ MEVDUAT HESABI
Açılış Bakiyesi: 72.000,00 TL

Tarih       İşlem Detayı                                 Borç         Alacak       Bakiye
02.08.2026  GELEN HAVALE - KURUMSAL DANIŞMANLIK BEDELİ                48.000,00   120.000,00
06.08.2026  KOSGEB AR-GE VE GİRİŞİMCİLİK HAKEDİŞİ                     15.000,00   135.000,00
10.08.2026  GİB VERGİ VE SGK PRİM ÖDEMESİ              16.800,00                  118.200,00
14.08.2026  ŞİRKET ARACI AKARYAKIT VE YOL GİDERİ        2.200,00                  116.000,00

Kapanış Bakiyesi: 116.000,00 TL`
  },

  // --- 🇬🇧 UNITED KINGDOM (BRITISH BANKS) ---
  hsbc_uk: {
    name: 'HSBC UK Commercial Banking (GBP)',
    bank: 'HSBC UK',
    region: 'UK',
    currency: 'GBP',
    text: `HSBC UK BANK PLC - COMMERCIAL CURRENT ACCOUNT
Account: 40-02-15 89201948 | Currency: GBP (£)
Opening Balance as of 01 Aug 2026: £24,500.00

Date        Payment Details                               Paid Out       Paid In        Balance
02/08/2026  BACS INFLOW - ENTERPRISE SOFTWARE CONTRACT                   £18,500.00     £43,000.00
04/08/2026  DIRECT DEBIT - CANARY WHARF LONDON OFFICE     £4,200.00                     £38,800.00
07/08/2026  FASTER PAYMENT - FREELANCE DEV CREW           £3,500.00                     £35,300.00
10/08/2026  HM REVENUE & CUSTOMS (HMRC VAT & PAYE)        £6,800.00                     £28,500.00
12/08/2026  STRIPE UK PAYOUTS - E-COMMERCE REVENUE                       £14,200.00     £42,700.00
15/08/2026  CARD PAYMENT - AWS EMEA CLOUD SERVICES        £1,450.00                     £41,250.00

Closing Balance as of 15 Aug 2026: £41,250.00`
  },

  barclays: {
    name: 'Barclays Business UK Account (GBP)',
    bank: 'Barclays Bank UK',
    region: 'UK',
    currency: 'GBP',
    text: `BARCLAYS BANK UK PLC
BUSINESS CURRENT ACCOUNT STATEMENT
Starting Balance: £12,800.00

Date        Description                                     Amount         Balance
02/08/2026  FASTER PAYMENTS IN - UK AGENCY RETAINER        +£8,500.00     £21,300.00
06/08/2026  HER MAJESTY'S REVENUE AND CUSTOMS (HMRC VAT)    -£2,400.00     £18,900.00
10/08/2026  LONDON COWORKING SPACE LEASE                    -£1,850.00     £17,050.00
14/08/2026  INCOMING BACS - CONSULTING SERVICES             +£6,200.00     £23,250.00

Closing Balance: £23,250.00`
  },

  lloyds: {
    name: 'Lloyds Bank Commercial Account (GBP)',
    bank: 'Lloyds Bank',
    region: 'UK',
    currency: 'GBP',
    text: `LLOYDS BANK PLC - BUSINESS ACCOUNT STATEMENT
Starting Balance: £35,000.00

Date        Description                                     Amount         Balance
01/08/2026  INCOMING CHAPS - CLIENT CORPORATE SETTLEMENT   +£25,000.00    £60,000.00
05/08/2026  MICROSOFT AZURE UK CLOUD INFRASTRUCTURE        -£2,800.00     £57,200.00
09/08/2026  STAFF PAYROLL - LLOYDS DIRECT DEBIT            -£18,500.00    £38,700.00
14/08/2026  UK DOMESTIC SALES REVENUE VIA SQUARE           +£11,300.00    £50,000.00

Ending Balance: £50,000.00`
  },

  // --- 🇫🇷 FRANCE (FRENCH BANKS) ---
  bnpparibas: {
    name: 'BNP Paribas Entreprises (EUR)',
    bank: 'BNP Paribas',
    region: 'FR',
    currency: 'EUR',
    text: `BNP PARIBAS S.A. - RELEVÉ DE COMPTE PROFESSIONNEL
Titulaire: TECH CONSULTING FRANCE SAS | Devise: EUR (€)
Solde Initial au 01.08.2026: 28.400,00 €

Date        Libellé de l'opération                          Débit          Crédit         Solde
02.08.2026  VIREMENT SEPA REÇU - PRESTATION DIGITALE                       18.500,00 €    46.900,00 €
05.08.2026  PRÉLÈVEMENT SEPA - LOYER BUREAU PARIS 8EME     3.800,00 €                    43.100,00 €
08.08.2026  CARTE BANCAIRE - OVHCLOUD SERVEURS FRANCE        650,00 €                    42.450,00 €
11.08.2026  PAIEMENT COTISATIONS URSSAF FRANCE             7.200,00 €                    35.250,00 €
14.08.2026  VIREMENT SEPA REÇU - FACTURE CLIENT RETAIL                    12.750,00 €    48.000,00 €
15.08.2026  SALAIRES ET PRIMES ÉQUIPE TECHNIQUE           14.000,00 €                    34.000,00 €

Solde Final au 15.08.2026: 34.000,00 €`
  },

  socgen: {
    name: 'Société Générale Pro (EUR)',
    bank: 'Société Générale',
    region: 'FR',
    currency: 'EUR',
    text: `SOCIÉTÉ GÉNÉRALE - EXTRAIT DE COMPTE COURANT
Solde Initial: 19.500,00 €

Date        Opération                                       Montant        Solde
03.08.2026  VIREMENT ENTRANT - CONSEIL EN IA ET CLOUD      +15.000,00 €   34.500,00 €
06.08.2026  ABONNEMENT SOFTWARE SAAS GOOGLE WORKSPACE        -420,00 €    34.080,00 €
10.08.2026  IMPÔT SUR LES SOCIÉTÉS (DGFIP FRANCE)          -5.600,00 €    28.480,00 €
13.08.2026  VENTE EN LIGNE STRIPE PAYMENTS FRANCE          +8.900,00 €    37.380,00 €

Solde Final: 37.380,00 €`
  },

  qonto: {
    name: 'Qonto Business FinTech (EUR)',
    bank: 'Qonto Business',
    region: 'FR',
    currency: 'EUR',
    text: `QONTO - OLINDA SAS - RELEVÉ BANCAIRE PRO
Solde de Départ: 14.200,00 €

Date        Détail de la transaction                        Montant        Solde
02.08.2026  VIREMENT INSTANTANÉ CLIENT E-COMMERCE          +12.800,00 €   27.000,00 €
05.08.2026  CARTE QONTO - PUBLICITÉ META FACEBOOK ADS      -1.950,00 €    25.050,00 €
09.08.2026  NOTION LABS ET SLACK ENTERPRISE                 -380,00 €     24.670,00 €
14.08.2026  VIREMENT REÇU LEVÉE DE FONDS PRE-SEED          +25.000,00 €   49.670,00 €

Solde de Fin: 49.670,00 €`
  },

  // --- 🇮🇹 ITALY (ITALIAN BANKS) ---
  intesa: {
    name: 'Intesa Sanpaolo Imprese (EUR)',
    bank: 'Intesa Sanpaolo',
    region: 'IT',
    currency: 'EUR',
    text: `INTESA SANPAOLO S.P.A. - ESTRATTO CONTO AZIENDALE
Intestatario: MILANO DIGITAL SOLUTIONS S.R.L. | Valuta: EUR (€)
Saldo Iniziale al 01.08.2026: 38.000,00 €

Data        Descrizione Movimento                           Dare           Avere          Saldo
02.08.2026  BONIFICO SEPA DISPOSTO - INCASSO FATTURA N.42                 24.000,00 €    62.000,00 €
05.08.2026  AFFITTO SEDE OPERATIVA MILANO CENTRO           3.500,00 €                    58.500,00 €
08.08.2026  PAGAMENTO F24 - IMPOSTE E CONTRIBUTI INPS      6.800,00 €                    51.700,00 €
11.08.2026  BONIFICO IN ENTRATA - VENDITA SERVIZI SOFTWARE                16.300,00 €    68.000,00 €
14.08.2026  STIPENDI E COMPENSI DIPENDENTI AGOSTO         18.500,00 €                    49.500,00 €

Saldo Finale al 15.08.2026: 49.500,00 €`
  },

  unicredit: {
    name: 'UniCredit Corporate Banking (EUR)',
    bank: 'UniCredit Bank',
    region: 'IT',
    currency: 'EUR',
    text: `UNICREDIT S.P.A. - MOVIMENTI CONTO CORRENTE BUSINESS
Saldo Iniziale: 22.400,00 €

Data        Causale Operazione                              Importo        Saldo
03.08.2026  BONIFICO BANCARIO - FORNITURA TECNOLOGICA      +19.500,00 €   41.900,00 €
06.08.2026  ADDEBITO DIRETTO SEPA - ENEL ENERGIA IMPRESE    -1.250,00 €   40.650,00 €
10.08.2026  CANONE ANNUALE CLOUD ARUBA ENTERPRISE            -890,00 €    39.760,00 €
14.08.2026  INCASSO POS COMMERCIO ELETTRONICO              +8.740,00 €    48.500,00 €

Saldo Finale: 48.500,00 €`
  },

  // --- 🇩🇪 GERMANY & 🇪🇸 SPAIN & 🇨🇭 SWITZERLAND ---
  deutschebank: {
    name: 'Deutsche Bank Geschäftskonto (EUR)',
    bank: 'Deutsche Bank',
    region: 'EU',
    currency: 'EUR',
    text: `DEUTSCHE BANK AG - KONTOAUSZUG
Kontoart: Geschäftskonto | Anfangssaldo: 32.000,00 EUR

Datum       Verwendungszweck / Buchungstext                Betrag         Saldo
03.08.2026  GUTSCHRIFT - IT-BERATUNG & LIZENZGEBÜHREN      +25.000,00     57.000,00
06.08.2026  LASTSCHRIFT - BÜROMIETE FRANKFURT              -4.500,00      52.500,00
10.08.2026  DATEV BUCHHALTUNGSSOFTWARE & LOHNABRECHNUNG    -1.200,00      51.300,00
14.08.2026  FINANZAMT UST-VORANMELDUNG Q3                  -8.300,00      43.000,00

Endsaldo: 43.000,00 EUR`
  },

  santander: {
    name: 'Banco Santander Empresas (EUR)',
    bank: 'Banco Santander',
    region: 'EU',
    currency: 'EUR',
    text: `BANCO SANTANDER S.A. - EXTRACTO DE CUENTA CORRIENTE
Saldo Inicial: 26.500,00 €

Fecha       Concepto / Movimiento                          Importe        Saldo
02.08.2026  TRANSFERENCIA SEPA RECIBIDA - CONSULTORÍA     +14.800,00 €   41.300,00 €
06.08.2026  RECIBO ALQUILER OFICINA MADRID                 -2.900,00 €   38.400,00 €
10.08.2026  LIQUIDACIÓN TRIBUTARIA AGENCIA TRIBUTARIA      -4.700,00 €   33.700,00 €
14.08.2026  INGRESOS PASARELA STRIPE ESPAÑA                +9.600,00 €   43.300,00 €

Saldo Final: 43.300,00 €`
  },

  ubs: {
    name: 'UBS Switzerland Corporate (CHF)',
    bank: 'UBS Switzerland',
    region: 'EU',
    currency: 'CHF',
    text: `UBS SWITZERLAND AG - KONTOAUSZUG / RELEVÉ DE COMPTE
Starting Balance: 45,000.00 CHF

Date        Description                                     Amount         Balance
02.08.2026  INCOMING WIRE - SWISS FINTECH CONSULTING       +35,000.00     80,000.00
06.08.2026  OFFICE LEASE ZURICH FINANCIAL DISTRICT         -5,800.00      74,200.00
10.08.2026  SWISS FEDERAL TAX ADMINISTRATION (ESTV)        -8,200.00      66,000.00
14.08.2026  GLOBAL ASSET MANAGEMENT FEES                   +18,000.00     84,000.00

Ending Balance: 84,000.00 CHF`
  },

  // --- 🇺🇸 USA ---
  chase: {
    name: 'JPMorgan Chase Checking (USD)',
    bank: 'JPMorgan Chase',
    region: 'US',
    currency: 'USD',
    text: `JPMORGAN CHASE BANK, N.A.
ACCOUNT STATEMENT - BUSINESS CHECKING
Beginning Balance as of August 1, 2026: $18,450.00

Date        Description                                     Amount         Balance
08/02/2026  STRIPE PAYOUTS INC - SOFTWARE REVENUE          +$14,250.00    $32,700.00
08/04/2026  GOOGLE WORKSPACE & CLOUD APPS SUBSCRIPTION     -$480.00       $32,220.00
08/06/2026  CLIENT WIRE TRANSFER - ENTERPRISE LICENSE      +$8,900.00     $41,120.00
08/08/2026  GITHUB ENTERPRISE & OPENAI API USAGE           -$1,250.00     $39,870.00
08/10/2026  WEWORK COWORKING MONTHLY OFFICE RENT           -$2,800.00     $37,070.00
08/12/2026  CONTRACTOR PAYMENTS VIA DEEL                   -$6,500.00     $30,570.00
08/14/2026  SHOPIFY APP REVENUE SHARE                      +$5,400.00     $35,970.00

Ending Balance as of August 15, 2026: $35,970.00`
  },

  boa: {
    name: 'Bank of America Business Advantage (USD)',
    bank: 'Bank of America',
    region: 'US',
    currency: 'USD',
    text: `BANK OF AMERICA, N.A.
BUSINESS ADVANTAGE CHECKING STATEMENT
Beginning balance on August 01, 2026: $24,500.00

Date        Description                                     Amount         Balance
08/03/2026  CUSTOMER DEPOSIT - WEB CONSULTING RETAINER     +$12,000.00    $36,500.00
08/07/2026  SLACK TECHNOLOGIES ANNUAL TEAM PLAN            -$1,800.00     $34,700.00
08/11/2026  PAYROLL DIRECT DEPOSIT - GUSTO INC             -$14,500.00    $20,200.00
08/15/2026  MERCHANT SALES REVENUE VIA SQUARE              +$9,800.00     $30,000.00

Ending balance on August 15, 2026: $30,000.00`
  },

  // --- 🌐 FINTECH ---
  revolut: {
    name: 'Revolut Multi-Currency Business (EUR)',
    bank: 'Revolut',
    region: 'FINTECH',
    currency: 'EUR',
    text: `REVOLUT LTD - BUSINESS ACCOUNT STATEMENT
Currency: EUR | Starting Balance: 15.400,00 €

Date        Description                                     Amount         Balance
02.08.2026  SEPA INFLOW - EU CLIENT SOFTWARE DEVELOPMENT   +14.500,00 €   29.900,00 €
05.08.2026  NOTION & FIGMA DESIGN TEAM SUBSCRIPTIONS        -320,00 €     29.580,00 €
09.08.2026  DIGITALOCEAN CLOUD INFRASTRUCTURE               -850,00 €     28.730,00 €
13.08.2026  SEPA OUTFLOW - FREELANCE DEV PAYMENTS          -5.200,00 €    23.530,00 €
15.08.2026  STRIPE PAYOUTS EUROPE                          +11.200,00 €   34.730,00 €

Ending Balance: 34.730,00 €`
  },

  stripe: {
    name: 'Stripe Global Payouts & Balance Summary',
    bank: 'Stripe Payouts',
    region: 'FINTECH',
    currency: 'USD',
    text: `STRIPE PAYMENTS INC. - SETTLEMENT SUMMARY
Opening Balance: $5,000.00

Date        Description                                     Amount         Balance
08/02/2026  DAILY BATCH REVENUE - US CUSTOMERS             +$8,400.00     $13,400.00
08/04/2026  STRIPE TRANSACTION PROCESSING FEES (2.9% + 30c) -$320.00       $13,080.00
08/07/2026  DAILY BATCH REVENUE - EU & GLOBAL CUSTOMERS    +$6,700.00     $19,780.00
08/10/2026  REFUND ISSUED - ORDER #84920                   -$150.00       $19,630.00
08/14/2026  AUTOMATIC PAYOUT TRANSFER TO CHECKING BANK     -$15,000.00    $4,630.00

Ending Available Balance: $4,630.00`
  }
};
