import React from 'react';
import { isChunkLoadError, reloadForChunkError } from '../chunkRecovery';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[NYTHOS] Uncaught render error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const chunkError = isChunkLoadError(this.state.error);

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh', gap: '16px',
          color: 'var(--text-muted)', fontFamily: 'monospace',
        }}>
          <div style={{ fontSize: '32px', opacity: 0.4 }}>◈</div>
          <div style={{ fontSize: '14px', letterSpacing: '2px' }}>NYTHOS ENCOUNTERED AN ERROR</div>
          <div style={{ fontSize: '11px', opacity: 0.5 }}>{this.state.error?.message}</div>
          <button
            onClick={() => {
              if (chunkError && reloadForChunkError(this.state.error)) return;
              if (chunkError && typeof window !== 'undefined') {
                window.location.reload();
                return;
              }
              this.setState({ hasError: false, error: null });
            }}
            style={{
              marginTop: '8px', background: 'transparent',
              border: '1px solid var(--accent)', color: 'var(--accent)',
              padding: '8px 20px', cursor: 'pointer', letterSpacing: '1px',
              fontSize: '11px', borderRadius: '3px',
            }}
          >
            {chunkError ? 'REFRESH APP' : 'RETRY'}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
