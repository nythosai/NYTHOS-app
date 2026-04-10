import React from 'react';
import './PriceBar.css';

export default function PriceBar({ prices }) {
  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const change = (n) => (n > 0 ? '+' : '') + Number(n).toFixed(2) + '%';

  return (
    <div className="price-bar">
      <div className="price-item">
        <span className="price-label">ETH</span>
        <span className="price-value">{fmt(prices.ETH.price)}</span>
        <span className={`price-change ${prices.ETH.change24h >= 0 ? 'pos' : 'neg'}`}>
          {change(prices.ETH.change24h)}
        </span>
      </div>
      <div className="price-divider" />
      <div className="price-item">
        <span className="price-label">BTC</span>
        <span className="price-value">{fmt(prices.BTC.price)}</span>
        <span className={`price-change ${prices.BTC.change24h >= 0 ? 'pos' : 'neg'}`}>
          {change(prices.BTC.change24h)}
        </span>
      </div>
    </div>
  );
}
