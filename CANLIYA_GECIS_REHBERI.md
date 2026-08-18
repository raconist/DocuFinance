# 🚀 DocuFinance AI - Canlıya Geçiş (Production Deployment) Rehberi

Bu rehber ile platformunuzu **Vercel**, **Netlify** veya **Cloudflare Pages** üzerinde 2 dakika içinde canlıya alabilir ve **Supabase PostgreSQL** veritabanını bağlayabilirsiniz.

---

## 🛠️ 1. Adım: Veritabanını Başlatma (Supabase PostgreSQL - 1 Dakika)

1. [Supabase.com](https://supabase.com) adresine gidin ve ücretsiz bir proje oluşturun (Örn: `docufinance-db`).
2. Sol menüden **SQL Editor** sekmesine tıklayın.
3. Projenizdeki [`supabase_schema.sql`](file:///c:/StarterStory/supabase_schema.sql) dosyasının tüm içeriğini yapıştırıp **"Run"** butonuna basın.
4. **Project Settings > API** bölümünden:
   * `Project URL` (Örn: `https://xyz.supabase.co`)
   * `anon / public key` değerlerini kopyalayın.

---

## ☁️ 2. Adım: Vercel / Netlify Üzerinde Tek Tıkla Canlıya Alma (1 Dakika)

### Seçenek A: Vercel ile Canlıya Alma (Önerilen)
1. GitHub veya GitLab reponuzu [Vercel.com](https://vercel.com)'a bağlayın (`Import Project`).
2. **Environment Variables** (Ortam Değişkenleri) bölümüne şunları ekleyin:
   * `VITE_SUPABASE_URL`: `https://sizin-projeniz.supabase.co`
   * `VITE_SUPABASE_ANON_KEY`: `sizin-anon-keyiniz`
3. **Deploy** butonuna basın! Siteniz anında `https://docufinance.vercel.app` (veya kendi özel alan adınızda) yayına girer.

---

## 💳 3. Adım: Ödeme Linklerinizi Tanımlama
Canlıya çıktıktan sonra sitenizdeki sağ üst **⚙️ Dişli (Admin)** ikonuna tıklayın:
1. **PayTR / Shopier** mağaza linkinizi girip kaydedin.
2. **LemonSqueezy** global ödeme linkinizi girip kaydedin.
3. Dilediğiniz zaman yeni indirim kuponları ve sınırsız Pro lisans kodları üretin.

---

## 🎯 Üretim Durumu Özeti:
* ✅ **Sıfır Sunucu Maliyeti:** Tüm PDF ve OCR işlemleri kullanıcının tarayıcısında gerçekleşir.
* ✅ **Hibrit Veritabanı:** Çevrimdışı/Hızlı kullanım için **IndexedDB** + Bulut yedekleme için **Supabase PostgreSQL**.
* ✅ **Zero-Knowledge Güvenliği:** KVKK ve GDPR ile %100 uyumlu.
