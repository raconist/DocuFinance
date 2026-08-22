/**
 * DocuFinance AI - Advanced Dynamic SEO & Schema Engine
 * Updates page title, meta descriptions, OpenGraph, Canonical URLs, and JSON-LD Rich Snippets dynamically.
 */

export function updatePageSeo({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
  jsonLdSchemas = []
}) {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  if (title) {
    document.title = title;
  }

  // 2. Helper to set or update meta tag
  const setMeta = (selector, attribute, value) => {
    let el = document.querySelector(selector);
    if (!el && value) {
      el = document.createElement('meta');
      if (selector.startsWith('meta[name=')) {
        const name = selector.match(/meta\[name="([^"]+)"\]/)[1];
        el.setAttribute('name', name);
      } else if (selector.startsWith('meta[property=')) {
        const prop = selector.match(/meta\[property="([^"]+)"\]/)[1];
        el.setAttribute('property', prop);
      }
      document.head.appendChild(el);
    }
    if (el && value) {
      el.setAttribute(attribute, value);
    }
  };

  // 3. Primary Meta Tags
  if (description) {
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }

  if (title) {
    setMeta('meta[name="title"]', 'content', title);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[name="twitter:title"]', 'content', title);
  }

  if (keywords) {
    setMeta('meta[name="keywords"]', 'content', keywords);
  }

  if (ogImage) {
    setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[name="twitter:image"]', 'content', ogImage);
  }

  // 4. Canonical Link
  if (canonicalUrl) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
  }

  // 5. Dynamic JSON-LD Structured Data (Rich Snippets)
  const existingDynamicSchemas = document.querySelectorAll('script[data-dynamic-seo="true"]');
  existingDynamicSchemas.forEach(el => el.remove());

  if (Array.isArray(jsonLdSchemas) && jsonLdSchemas.length > 0) {
    jsonLdSchemas.forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-seo', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }
}

/**
 * Generate Google Rich Snippet JSON-LD for a Specific Bank / Service SEO Page
 */
export function generateBankSeoSchemas(bankData) {
  if (!bankData) return [];

  const canonicalUrl = `https://docufinance.site/convert/${bankData.slug}`;

  // 1. BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Ana Sayfa',
        'item': 'https://docufinance.site/'
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Banka & Muhasebe Ekstre Çevirici',
        'item': 'https://docufinance.site/#banks'
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': bankData.bank,
        'item': canonicalUrl
      }
    ]
  };

  // 2. FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': (bankData.faq || []).map(item => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  };

  // 3. SoftwareApplication / Tool Schema
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': `DocuFinance AI - ${bankData.bank} Ekstre Çevirici`,
    'operatingSystem': 'Web, Windows, macOS, Linux, iOS, Android',
    'applicationCategory': 'FinanceApplication, BusinessApplication',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.95',
      'reviewCount': '1650'
    },
    'description': bankData.description
  };

  // 4. HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `${bankData.bank} PDF Ekstresini Excel'e Dönüştürme Adımları`,
    'step': [
      {
        '@type': 'HowToStep',
        'name': '1. PDF Ekstresini Yükleyin',
        'text': `${bankData.bank} internet şubesinden aldığınız PDF hesap özetini yükleme alanına bırakın.`
      },
      {
        '@type': 'HowToStep',
        'name': '2. Sıfır-Bilgi Güvenliği ile Ayrıştırma',
        'text': 'Tüm veriler tarayıcınızda sıfır-bilgi güvenliği ile saniyeler içinde işlenir ve formüllere dökülür.'
      },
      {
        '@type': 'HowToStep',
        'name': '3. Excel, CSV veya Muhasebe Fişi Olarak İndirin',
        'text': 'Luca, Zirve, Logo veya formüllü Excel (.xlsx) dosyanızı tek tıkla cihazınıza kaydedin.'
      }
    ]
  };

  return [breadcrumbSchema, faqSchema, appSchema, howToSchema];
}
