// Real notification service — works on the client side
// - Browser Push (Web Notifications API)
// - Sound alert
// - Vibration (mobile)
// - Email via mailto: link
// - WhatsApp via wa.me link
// - Bale via ble.ir link
// - SMS via sms: link

export type DeliveryChannel = 'inapp' | 'push' | 'email' | 'whatsapp' | 'bale' | 'sms';

export interface DeliveryTarget {
  email?: string;
  phone?: string;
}

export interface DeliveryResult {
  channel: DeliveryChannel;
  ok: boolean;
  message?: string;
}

// ---- Permissions ----
export function getNotifyPermission(): NotificationPermission {
  if ('Notification' in window) return Notification.permission;
  return 'denied';
}

export async function requestNotifyPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

// ---- Sound ----
let audioCtx: AudioContext | null = null;

export function playNotificationSound(kind: 'normal' | 'warning' | 'critical' = 'normal') {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Different tones for different kinds
    const freqs = kind === 'critical' ? [880, 660, 880, 660] :
      kind === 'warning' ? [660, 880] :
        [523, 784]; // C5, G5

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.18, now + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.15);
    });
  } catch { /* ignore */ }
}

export function vibrate(pattern: number[] = [120, 60, 120]) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  } catch { /* ignore */ }
}

// ---- Browser Push ----
export function showBrowserNotification(title: string, body: string, opts?: { icon?: string; tag?: string; requireInteraction?: boolean }): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const n = new Notification(title, {
      body,
      icon: opts?.icon ?? '/favicon.ico',
      tag: opts?.tag,
      dir: 'rtl',
      lang: 'fa',
      requireInteraction: opts?.requireInteraction ?? false,
      badge: opts?.icon,
    });
    setTimeout(() => n.close(), 8000);
    return true;
  } catch {
    return false;
  }
}

// ---- Email (opens email client with prefilled message) ----
export function sendEmail(target: string, subject: string, body: string): boolean {
  if (!target) return false;
  const url = `mailto:${encodeURIComponent(target)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
  return true;
}

// ---- WhatsApp ----
function normalizePhone(phone: string): string {
  // Remove all non-digit characters, convert Persian/Arabic digits
  const ar2en: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
  };
  let s = phone.replace(/./g, ch => ar2en[ch] ?? ch).replace(/\D/g, '');
  if (s.startsWith('00')) s = s.slice(2);
  if (s.startsWith('0')) s = '98' + s.slice(1);
  if (s.startsWith('9') && s.length === 10) s = '98' + s;
  return s;
}

export function sendWhatsApp(phone: string, message: string): boolean {
  if (!phone) return false;
  const num = normalizePhone(phone);
  const url = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

// ---- Bale Messenger ----
export function sendBale(phone: string, message: string): boolean {
  if (!phone) return false;
  const num = normalizePhone(phone);
  // Bale supports ble.ir/<phone> or ble.ir/<username>
  const url = `https://ble.ir/${num}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

// ---- SMS ----
export function sendSMS(phone: string, message: string): boolean {
  if (!phone) return false;
  const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
  window.open(url, '_self');
  return true;
}

// ---- Master dispatcher ----
export interface NotifyDispatch {
  channels: DeliveryChannel[];
  target?: DeliveryTarget;
  title: string;
  body: string;
  kind?: 'normal' | 'warning' | 'critical';
  silent?: boolean;
}

export function dispatchNotification(opts: NotifyDispatch): DeliveryResult[] {
  const results: DeliveryResult[] = [];
  const { channels, target, title, body, kind = 'normal', silent } = opts;

  // In-app & sound always
  if (channels.includes('inapp')) {
    if (!silent) {
      playNotificationSound(kind);
      if (kind === 'critical') vibrate([200, 80, 200, 80, 200]);
      else if (kind === 'warning') vibrate([150, 60, 150]);
    }
    results.push({ channel: 'inapp', ok: true });
  }

  if (channels.includes('push')) {
    const ok = showBrowserNotification(title, body, { requireInteraction: kind === 'critical' });
    results.push({ channel: 'push', ok, message: ok ? undefined : 'مجوز اعلان داده نشده' });
  }

  if (channels.includes('email') && target?.email) {
    sendEmail(target.email, title, body);
    results.push({ channel: 'email', ok: true });
  } else if (channels.includes('email')) {
    results.push({ channel: 'email', ok: false, message: 'ایمیل گیرنده موجود نیست' });
  }

  if (channels.includes('whatsapp') && target?.phone) {
    sendWhatsApp(target.phone, `${title}\n${body}`);
    results.push({ channel: 'whatsapp', ok: true });
  } else if (channels.includes('whatsapp')) {
    results.push({ channel: 'whatsapp', ok: false, message: 'شماره تماس گیرنده موجود نیست' });
  }

  if (channels.includes('bale') && target?.phone) {
    sendBale(target.phone, `${title}\n${body}`);
    results.push({ channel: 'bale', ok: true });
  } else if (channels.includes('bale')) {
    results.push({ channel: 'bale', ok: false, message: 'شماره تماس گیرنده موجود نیست' });
  }

  if (channels.includes('sms') && target?.phone) {
    sendSMS(target.phone, `${title}\n${body}`);
    results.push({ channel: 'sms', ok: true });
  } else if (channels.includes('sms')) {
    results.push({ channel: 'sms', ok: false, message: 'شماره تماس گیرنده موجود نیست' });
  }

  return results;
}

// ---- User preferences (stored in localStorage) ----
const PREF_KEY = 'baspar_notify_prefs_v1';
export interface NotifyPrefs {
  sound: boolean;
  vibration: boolean;
  push: boolean;
  defaultChannels: DeliveryChannel[];
}

const DEFAULT_PREFS: NotifyPrefs = {
  sound: true,
  vibration: true,
  push: true,
  defaultChannels: ['inapp', 'push'],
};

export function getNotifyPrefs(): NotifyPrefs {
  try {
    const s = localStorage.getItem(PREF_KEY);
    if (s) return { ...DEFAULT_PREFS, ...JSON.parse(s) };
  } catch { /* ignore */ }
  return DEFAULT_PREFS;
}

export function saveNotifyPrefs(p: NotifyPrefs) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// Module initialized

