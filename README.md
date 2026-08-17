# 🚀 DocuFinance AI (v2.7) - Finansal Ekstre & Fatura Çevirici

Banka ekstrelerini ve e-faturaları 2 saniyede formüllü Microsoft Excel (.xlsx), CSV ve JSON formatına dönüştüren İstemci Taraflı (Zero-Knowledge) FinTech platformu.

---

## 🛠️ Yarın Kaldığınız Yerden Devam Etmek İçin:

### 1. Uygulamayı Başlatma (Lokal):
Terminalde veya PowerShell'de bu klasördeyken (`c:\StarterStory`):
```bash
npm run dev
```
Tarayıcınızda açılacak adres: 👉 **`http://localhost:5173/`**

---

### 2. Canlıya Alma (Vercel):
```powershell
powershell -ExecutionPolicy Bypass -Command "npx.cmd vercel"
```
*(Bu komut doğrudan Vercel hesabınıza bağlanarak sitenizi `docufinance.vercel.app` adresinde yayına açar.)*

---

## 📁 Önemli Dosyalar & Modüller:
* [`src/App.jsx`](src/App.jsx) - Ana uygulama ve durum yöneticisi
* [`src/components/DataStudio.jsx`](src/components/DataStudio.jsx) - Canlı Excel tablosu, mutabakat ve sıralama motoru
* [`src/components/PricingModal.jsx`](src/components/PricingModal.jsx) - Birebir kur oranları (€19 / $20 / ₺950) ve kupon sistemi
* [`src/utils/parserEngine.js`](src/utils/parserEngine.js) - 25+ Türk ve Global banka ayrıştırma kuralları
* [`src/utils/dbStorage.js`](src/utils/dbStorage.js) - İstemci taraflı şifreli IndexedDB geçmiş yönetimi
* [`LAUNCH_PACK.md`](LAUNCH_PACK.md) - İlk müşterileri çekmek için hazır LinkedIn, Twitter ve Reddit pazarlama metinleri
* [`walkthrough.md`](../brain/06843554-ed7c-44a5-85ae-e7887cf8eb63/walkthrough.md) - Detaylı mimari ve ekran kayıtları
