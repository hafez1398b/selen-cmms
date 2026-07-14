import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null; info: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: '' };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: error.stack ?? '' };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string | null }) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, info: errorInfo.componentStack ?? error.stack ?? '' });
  }

  resetAndReload = () => {
    try {
      // Clear all app storage so user can recover from corrupted state
      const keys = ['baspar_foam_v1', 'baspar_foam_v2', 'baspar_foam_v3', 'baspar_seed_version', 'baspar_assistant_chat_v1', 'baspar_notify_prefs_v1'];
      keys.forEach(k => localStorage.removeItem(k));
    } catch { /* */ }
    window.location.reload();
  };

  reload = () => window.location.reload();

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, fontFamily: 'Vazirmatn, system-ui, sans-serif', direction: 'rtl',
          background: 'linear-gradient(180deg, #06060a 0%, #0d0d11 100%)', color: '#ededf0',
        }}>
          <div style={{
            maxWidth: 600, width: '100%', padding: 28, borderRadius: 16,
            background: 'linear-gradient(180deg, rgba(31,31,37,0.95), rgba(13,13,17,0.95))',
            border: '1px solid rgba(245,158,11,0.35)',
            boxShadow: '0 20px 60px -10px rgba(245,158,11,0.25)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              fontSize: 32,
            }}>⚠️</div>
            <h1 style={{
              fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 8,
              background: 'linear-gradient(135deg, #fff1c7, #ffcb4d, #b45309, #fff1c7)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>خطایی پیش‌آمده است</h1>
            <p style={{ fontSize: 13, color: '#b4b4bf', textAlign: 'center', lineHeight: 1.7, marginBottom: 20 }}>
              متأسفانه برنامه با خطا مواجه شد. این معمولاً به دلیل ناسازگاری داده‌های قدیمی ذخیره‌شده در مرورگر است.
              می‌توانید با پاک‌سازی داده‌های محلی، برنامه را به حالت اولیه برگردانید.
            </p>

            <div style={{
              padding: 12, borderRadius: 8, background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.25)', marginBottom: 16,
              fontSize: 11, color: '#fda4af', fontFamily: 'monospace',
              direction: 'ltr', textAlign: 'left', wordBreak: 'break-word',
              maxHeight: 120, overflow: 'auto',
            }}>
              <strong>{this.state.error.name}: {this.state.error.message}</strong>
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <button onClick={this.resetAndReload}
                style={{
                  padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #fff1c7 0%, #ffb524 30%, #b45309 100%)',
                  color: '#0d0d11', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}>
                🔄 پاک‌سازی داده‌ها و بازنشانی کامل (توصیه می‌شود)
              </button>
              <button onClick={this.reload}
                style={{
                  padding: '10px 16px', borderRadius: 10,
                  border: '1px solid rgba(245,158,11,0.4)', background: 'transparent',
                  color: '#ffcb4d', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}>
                ↻ فقط بارگذاری مجدد (بدون پاک‌سازی)
              </button>
            </div>

            <details style={{ marginTop: 16 }}>
              <summary style={{ fontSize: 11, color: '#888896', cursor: 'pointer' }}>جزئیات فنی</summary>
              <pre style={{
                marginTop: 8, padding: 12, borderRadius: 6, background: 'rgba(0,0,0,0.3)',
                fontSize: 10, color: '#888896', maxHeight: 200, overflow: 'auto',
                direction: 'ltr', textAlign: 'left', whiteSpace: 'pre-wrap',
              }}>{this.state.info}</pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
