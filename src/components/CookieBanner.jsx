import { useState, useEffect } from 'react';
import './CookieBanner.css';

const STORAGE_KEY = 'nythos_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
      <p className="cookie-text">
        We use cookies to remember your preferences and measure usage.{' '}
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
      </p>
      <div className="cookie-actions">
        <button className="cookie-btn cookie-btn--decline" onClick={decline}>
          Decline
        </button>
        <button className="cookie-btn cookie-btn--accept" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  );
}
