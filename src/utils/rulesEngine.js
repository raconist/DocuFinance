/**
 * DocuFinance AI - Smart Accounting Rules Engine
 * Maps transaction keywords to standard Chart of Accounts (TDHP / Tekdüzen Hesap Planı)
 * and business expense categories.
 */

export const DEFAULT_RULES = [
  {
    id: 'rule_fuel',
    keywords: ['shell', 'bp', 'opet', 'petrol', 'petrolofisi', 'total', 'aytemiz', 'lukoil', 'yakit', 'yakıt', 'benzin', 'otogaz', 'akaryakit', 'akaryakıt', 'uber', 'marti', 'martı', 'taxi', 'taksi', 'bilet', 'thy', 'pegasus'],
    category: 'Akaryakıt & Ulaşım',
    accountCode: '770.01',
    accountName: 'Ulaşım ve Akaryakıt Giderleri',
    color: '#f59e0b'
  },
  {
    id: 'rule_food',
    keywords: ['yemeksepeti', 'getir', 'trendyol yemek', 'migros yemek', 'starbucks', 'kahve', 'restoran', 'cafe', 'kafe', 'lokanta', 'bufe', 'büfe', 'doner', 'döner', 'burger', 'mcdonalds', 'dominos', 'espresso', 'pastane', 'firin', 'fırın', 'sodexo', 'multinet'],
    category: 'Yemek & Ağırlama',
    accountCode: '770.02',
    accountName: 'Temsil ve Ağırlama / Yemek Giderleri',
    color: '#10b981'
  },
  {
    id: 'rule_rent',
    keywords: ['kira', 'kira odemesi', 'kira ödemesi', 'ofis kirasi', 'ofis kirası', 'aidat', 'bina aidat', 'site yonetimi', 'site yönetimi', 'plaza', 'emlak', 'depo kira'],
    category: 'Kira & Bina Aidatı',
    accountCode: '770.03',
    accountName: 'Kira ve Tesis Yönetim Giderleri',
    color: '#8b5cf6'
  },
  {
    id: 'rule_bank_fees',
    keywords: ['eft masraf', 'havale ucret', 'havale ücret', 'bsmv', 'hesap isletim', 'hesap işletim', 'pos komisyon', 'ekstre ucreti', 'uyelik aidati', 'üyelik aidatı', 'komisyon', 'faiz tahakkuk', 'swift masraf', 'pos bloke', 'banka ucret'],
    category: 'Banka & Finansman Masrafları',
    accountCode: '770.04',
    accountName: 'Banka Masrafları ve Komisyonlar',
    color: '#ef4444'
  },
  {
    id: 'rule_telecom',
    keywords: ['turkcell', 'vodafone', 'turk telekom', 'türk telekom', 'superonline', 'millenicom', 'ttnet', 'internet', 'gsm', 'telefon faturasi', 'telefon faturası', 'hosting', 'domain', 'sunucu'],
    category: 'Haberleşme & İnternet',
    accountCode: '770.05',
    accountName: 'Haberleşme ve İletişim Giderleri',
    color: '#06b6d4'
  },
  {
    id: 'rule_cloud_saas',
    keywords: ['aws', 'amazon web', 'google cloud', 'google workspace', 'microsoft', 'azure', 'openai', 'chatgpt', 'github', 'vercel', 'canva', 'adobe', 'slack', 'notion', 'zoom', 'figma', 'digitalocean', 'heroku'],
    category: 'Yazılım & Bulut Hizmetleri',
    accountCode: '770.06',
    accountName: 'Yazılım Lisans ve Bulut Giderleri',
    color: '#3b82f6'
  },
  {
    id: 'rule_cargo',
    keywords: ['yurtici kargo', 'yurtiçi kargo', 'aras kargo', 'mng kargo', 'surat kargo', 'sürat kargo', 'ptt kargo', 'ups kargo', 'dhl', 'fedex', 'trendyol express', 'kargo', 'kurye'],
    category: 'Kargo & Lojistik',
    accountCode: '770.07',
    accountName: 'Kargo ve Nakliye Giderleri',
    color: '#ec4899'
  },
  {
    id: 'rule_office_supplies',
    keywords: ['d&r', 'kirtasiye', 'kırtasiye', 'koctas', 'koçtaş', 'ikea', 'teknosa', 'mediamarkt', 'toner', 'kagit', 'kağıt', 'ofis malzeme', 'bauhaus', 'avansas'],
    category: 'Ofis & Sarf Malzemeleri',
    accountCode: '770.08',
    accountName: 'Kırtasiye ve Büro Malzemesi Giderleri',
    color: '#14b8a6'
  },
  {
    id: 'rule_payroll',
    keywords: ['maas', 'maaş', 'net maas', 'net maaş', 'avans', 'personel', 'hakedis', 'hakediş', 'prim', 'agi', 'tazminat', 'ikramiye', 'maas odemesi', 'maaş ödemesi'],
    category: 'Maaş & Personel Ödemeleri',
    accountCode: '335.01',
    accountName: 'Personele Borçlar / Ücret Ödemeleri',
    color: '#f97316'
  },
  {
    id: 'rule_taxes',
    keywords: ['vergi', 'gib', 'gelir idaresi', 'kdv', 'muhtasar', 'gecici vergi', 'geçici vergi', 'gelir vergisi', 'damga vergisi', 'harc', 'harç', 'vergi dairesi', 'gumruk', 'gümrük', 'belediye emlak'],
    category: 'Vergi & Resmi Harçlar',
    accountCode: '360.01',
    accountName: 'Ödenecek Vergi ve Fonlar',
    color: '#dc2626'
  },
  {
    id: 'rule_sgk',
    keywords: ['sgk', 'ssk', 'bagkur', 'bağkur', 'sgk prim', 'prim odemesi', 'gss', 'sosyal guvenlik', 'sosyal güvenlik'],
    category: 'SGK & Sosyal Güvenlik',
    accountCode: '361.01',
    accountName: 'Ödenecek Sosyal Güvenlik Kesintileri',
    color: '#e11d48'
  },
  {
    id: 'rule_revenue',
    keywords: ['fatura tahsilat', 'satis bedeli', 'satış bedeli', 'hakedis bedeli', 'musteri odemesi', 'müşteri ödemesi', 'pos tahsilat', 'gelen havale satis', 'fatura karsiligi', 'fatura karşılığı'],
    category: 'Satış & Hasılat Tahsilatı',
    accountCode: '600.01',
    accountName: 'Yurtiçi Satışlar / Tahsilatlar',
    color: '#22c55e'
  }
];

const STORAGE_KEY = 'docufinance_smart_rules_v1';

/**
 * Get active rules from localStorage or fallback to defaults
 */
export function getStoredRules() {
  if (typeof window === 'undefined') return DEFAULT_RULES;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load rules:', e);
  }
  return DEFAULT_RULES;
}

/**
 * Save rules to localStorage
 */
export function saveStoredRules(rules) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save rules:', e);
  }
}

/**
 * Reset rules to default
 */
export function resetRulesToDefault() {
  saveStoredRules(DEFAULT_RULES);
  return DEFAULT_RULES;
}

/**
 * Apply rules to a list of transaction rows.
 * Fills in category, accountCode, and matched rule metadata.
 * 
 * @param {Array} rows 
 * @param {Array} customRules Optional custom rules list
 * @returns {Array} Updated rows
 */
export function applyRulesToTransactions(rows = [], customRules = null) {
  const rules = customRules || getStoredRules();

  return rows.map(row => {
    const descLower = (row.description || '').toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

    let matchedRule = null;

    for (const rule of rules) {
      for (const kw of rule.keywords) {
        const cleanKw = kw.toLowerCase()
          .replace(/ı/g, 'i')
          .replace(/ğ/g, 'g')
          .replace(/ü/g, 'u')
          .replace(/ş/g, 's')
          .replace(/ö/g, 'o')
          .replace(/ç/g, 'c');

        if (descLower.includes(cleanKw)) {
          matchedRule = rule;
          break;
        }
      }
      if (matchedRule) break;
    }

    if (matchedRule) {
      return {
        ...row,
        category: matchedRule.category,
        accountCode: matchedRule.accountCode,
        accountName: matchedRule.accountName,
        categoryColor: matchedRule.color,
        isAutoCategorized: true
      };
    }

    // Default fallback if not matched
    const isIncome = (row.credit || 0) > (row.debit || 0);
    return {
      ...row,
      category: row.category || (isIncome ? 'Diğer Gelirler' : 'Genel Giderler'),
      accountCode: row.accountCode || (isIncome ? '600.99' : '770.99'),
      accountName: row.accountName || (isIncome ? 'Diğer Satış ve Gelirler' : 'Diğer Genel Yönetim Giderleri'),
      isAutoCategorized: false
    };
  });
}
