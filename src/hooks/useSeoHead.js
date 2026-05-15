import { useEffect } from 'react';

const DEFAULT_TITLE = 'NYTHOS - The Dark Intelligence of the Blockchain';
const DEFAULT_DESC  = 'Real-time whale signal detection. AI-scored on-chain intelligence. Personalized to your wallet.';
const DEFAULT_URL   = 'https://www.nythos.io/';

function setMeta(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attrName, attrVal] = selector.match(/\[([^=]+)="([^"]+)"\]/).slice(1);
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Lightweight per-page SEO — updates <title>, meta tags, og tags, canonical, and robots
 * without react-helmet. Restores defaults on unmount.
 *
 * @param {object} opts
 * @param {string} [opts.title]       Full page title string
 * @param {string} [opts.description] Meta description (max ~155 chars)
 * @param {string} [opts.canonical]   Canonical URL for this page
 * @param {string} [opts.ogImage]     Override og:image (defaults to site OG image)
 * @param {boolean} [opts.noindex]    Set noindex,nofollow for auth-gated pages
 * @param {object[]} [opts.breadcrumb] Array of {name, url} for BreadcrumbList JSON-LD
 */
export function useSeoHead({ title, description, canonical, ogImage, noindex = false, breadcrumb } = {}) {
  useEffect(() => {
    const prevTitle = document.title;

    if (title) {
      document.title = title;
      setMeta('meta[property="og:title"]',    'content', title);
      setMeta('meta[name="twitter:title"]',   'content', title);
    }

    if (description) {
      setMeta('meta[name="description"]',          'content', description);
      setMeta('meta[property="og:description"]',   'content', description);
      setMeta('meta[name="twitter:description"]',  'content', description);
    }

    if (canonical) {
      setMeta('meta[property="og:url"]', 'content', canonical);
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    if (ogImage) {
      setMeta('meta[property="og:image"]',      'content', ogImage);
      setMeta('meta[name="twitter:image"]',     'content', ogImage);
    }

    let robotsEl = null;
    if (noindex) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      robotsEl.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(robotsEl);
    }

    let breadcrumbScript = null;
    if (breadcrumb?.length) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.type = 'application/ld+json';
      breadcrumbScript.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumb.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      });
      document.head.appendChild(breadcrumbScript);
    }

    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      setMeta('meta[property="og:title"]',    'content', DEFAULT_TITLE);
      setMeta('meta[name="twitter:title"]',   'content', DEFAULT_TITLE);
      setMeta('meta[name="description"]',          'content', DEFAULT_DESC);
      setMeta('meta[property="og:description"]',   'content', DEFAULT_DESC);
      setMeta('meta[name="twitter:description"]',  'content', DEFAULT_DESC);
      setMeta('meta[property="og:url"]', 'content', DEFAULT_URL);
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) canonicalLink.setAttribute('href', DEFAULT_URL);
      if (robotsEl) robotsEl.remove();
      if (breadcrumbScript) breadcrumbScript.remove();
    };
  }, [title, description, canonical, ogImage, noindex, breadcrumb]);
}
