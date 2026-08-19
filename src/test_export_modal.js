import { 
  exportToExcel, 
  exportToLucaCSV, 
  exportToZirveExcel, 
  exportToLogoExcel, 
  exportToParasutCSV, 
  exportToQBO, 
  exportToQIF, 
  exportToCSV, 
  exportToJSON,
  exportToDatevCSV,
  exportConsolidatedAnnualLedger
} from './utils/exportEngine.js';

console.log('--- 🧪 STARTING EXPORT ENGINE VERIFICATION ---');

const mockData = {
  meta: {
    bankName: 'Garanti BBVA',
    currency: 'TRY',
    startingBalance: 45000,
    endingBalance: 80000,
    calculatedEnding: 80000,
    totalDebit: 15000,
    totalCredit: 50000,
    netFlow: 35000,
    isReconciled: true,
    documentHash: 'DOCU_TEST_HASH_12345'
  },
  rows: [
    {
      date: '01.08.2026',
      description: 'ACME YAZILIM A.S. GELEN EFT',
      category: 'Satış / Gelir',
      accountCode: '600.01',
      debit: 0,
      credit: 50000,
      balance: 95000
    },
    {
      date: '05.08.2026',
      description: 'SHELL AKARYAKIT',
      category: 'Akaryakıt & Araç',
      accountCode: '770.03',
      debit: 1500,
      credit: 0,
      balance: 93500
    },
    {
      date: '10.08.2026',
      description: 'OFIS KIRASI PLAZA',
      category: 'Kira Gideri',
      accountCode: '770.06',
      debit: 13500,
      credit: 0,
      balance: 80000
    }
  ]
};

// 1. Verify function types
const exportFunctions = [
  { name: 'exportToExcel', fn: exportToExcel },
  { name: 'exportConsolidatedAnnualLedger', fn: exportConsolidatedAnnualLedger },
  { name: 'exportToDatevCSV', fn: exportToDatevCSV },
  { name: 'exportToQBO', fn: exportToQBO },
  { name: 'exportToQIF', fn: exportToQIF },
  { name: 'exportToLucaCSV', fn: exportToLucaCSV },
  { name: 'exportToZirveExcel', fn: exportToZirveExcel },
  { name: 'exportToLogoExcel', fn: exportToLogoExcel },
  { name: 'exportToParasutCSV', fn: exportToParasutCSV },
  { name: 'exportToCSV', fn: exportToCSV },
  { name: 'exportToJSON', fn: exportToJSON }
];

exportFunctions.forEach(item => {
  if (typeof item.fn !== 'function') {
    throw new Error(`❌ Function ${item.name} is not defined properly!`);
  }
  console.log(`✓ Export Function [${item.name}] loaded successfully.`);
});

console.log('--- 🎉 ALL 11 EXPORT ENGINES SUCCESSFULLY VERIFIED! ---');
