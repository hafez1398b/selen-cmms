import { useState, useEffect } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, timeAgo, uid } from '../lib/utils';
import { useToast } from '../components/Toast';
import {
  requestNotifyPermission, getNotifyPermission, playNotificationSound, vibrate,
  showBrowserNotification, sendEmail, sendWhatsApp, sendBale, sendSMS,
  getNotifyPrefs, saveNotifyPrefs, type NotifyPrefs, type DeliveryChannel,
} from '../lib/notify';

export function NotificationCenter() {
  const { notifications, markAllNotificationsRead, markNotificationRead, users, currentUser, pushNotification } = useApp();
  const toast = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(getNotifyPermission());
  const [prefs, setPrefs] = useState<NotifyPrefs>(getNotifyPrefs());
  const [testTarget, setTestTarget] = useState<string>(currentUser?.id ?? users[0]?.id ?? '');
  const [testTitle, setTestTitle] = useState('تست اعلان سامانه بسپارفوم غرب');
  const [testBody, setTestBody] = useState('این پیام برای آزمایش کانال‌های اطلاع‌رسانی ارسال شده است. در صورت دریافت، لطفاً تأیید کنید.');

  useEffect(() => { saveNotifyPrefs(prefs); }, [prefs]);

  const askPermission = async () => {
    const p = await requestNotifyPermission();
    setPermission(p);
    if (p === 'granted') {
      toast.push('مجوز نمایش اعلان مرورگر داده شد', 'success');
      showBrowserNotification('بسپارفوم غرب', 'اعلانات مرورگر اکنون فعال است ✓');
    } else if (p === 'denied') {
      toast.push('مجوز رد شد — از تنظیمات مرورگر، آن را فعال کنید', 'error');
    }
  };

  const targetUser = users.find(u => u.id === testTarget);

  const testInapp = () => {
    pushNotification({
      id: uid('n'), type: 'wo_new', title: testTitle, body: testBody,
      at: new Date().toISOString(), read: false, channel: ['inapp', 'push'],
    });
    toast.push('اعلان درون‌برنامه‌ای ارسال شد', 'success');
  };

  const testSound = () => { playNotificationSound('normal'); toast.push('🔔 صدای اعلان پخش شد'); };
  const testSoundWarning = () => { playNotificationSound('warning'); toast.push('⚠ صدای هشدار پخش شد'); };
  const testSoundCritical = () => { playNotificationSound('critical'); toast.push('🚨 صدای بحرانی پخش شد'); };
  const testVibrate = () => { vibrate([200, 100, 200, 100, 200]); toast.push('📳 لرزش اجرا شد (در صورت پشتیبانی)'); };

  const testPush = () => {
    if (permission !== 'granted') { toast.push('ابتدا مجوز اعلان را بدهید', 'warning'); return; }
    const ok = showBrowserNotification(testTitle, testBody, { requireInteraction: false });
    if (ok) toast.push('اعلان مرورگر نمایش داده شد', 'success');
    else toast.push('خطا در نمایش اعلان مرورگر', 'error');
  };

  const testEmail = () => {
    if (!targetUser?.email) { toast.push('ایمیل گیرنده موجود نیست', 'error'); return; }
    sendEmail(targetUser.email, testTitle, testBody);
    toast.push(`کلاینت ایمیل با گیرنده ${targetUser.email} باز شد`, 'success');
  };

  const testWhatsApp = () => {
    if (!targetUser?.phone) { toast.push('شماره گیرنده موجود نیست', 'error'); return; }
    sendWhatsApp(targetUser.phone, `${testTitle}\n${testBody}`);
    toast.push(`واتس‌اپ با گیرنده ${targetUser.name} باز شد`, 'success');
  };

  const testBale = () => {
    if (!targetUser?.phone) { toast.push('شماره گیرنده موجود نیست', 'error'); return; }
    sendBale(targetUser.phone, `${testTitle}\n${testBody}`);
    toast.push(`بله با گیرنده ${targetUser.name} باز شد`, 'success');
  };

  const testSMS = () => {
    if (!targetUser?.phone) { toast.push('شماره گیرنده موجود نیست', 'error'); return; }
    sendSMS(targetUser.phone, `${testTitle}\n${testBody}`);
    toast.push(`کلاینت پیامک با گیرنده باز شد`, 'success');
  };

  const toggleChannel = (ch: DeliveryChannel) => {
    setPrefs(p => ({
      ...p,
      defaultChannels: p.defaultChannels.includes(ch)
        ? p.defaultChannels.filter(c => c !== ch)
        : [...p.defaultChannels, ch],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Permission banner */}
      {permission !== 'granted' && (
        <div className="surface ring-gold rounded-2xl p-4 flex items-start gap-3 flex-wrap">
          <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300"><I.Bell size={20} /></div>
          <div className="flex-1 min-w-[200px]">
            <h4 className="font-bold text-sm text-gold-gradient">فعال‌سازی اعلانات مرورگر</h4>
            <p className="text-xs text-ink-300 mt-1">برای دریافت اعلانات حتی زمانی که در سامانه نیستید، مجوز اعلان مرورگر را فعال کنید.</p>
          </div>
          <button onClick={askPermission} className="btn-gold px-4 py-2 rounded-lg text-xs">
            {permission === 'denied' ? 'مجوز رد شده — تنظیمات مرورگر را چک کنید' : 'فعال‌سازی اعلانات'}
          </button>
        </div>
      )}

      {permission === 'granted' && (
        <div className="surface rounded-2xl p-4 flex items-center gap-3 border-emerald-400/30">
          <I.Check className="text-emerald-400" size={20} />
          <span className="text-sm text-emerald-200">اعلانات مرورگر فعال است — شما می‌توانید اعلانات لحظه‌ای دریافت کنید</span>
        </div>
      )}

      {/* Test panel */}
      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
          <I.Spark size={16} /> پنل تست اعلانات واقعی
        </h3>
        <p className="text-xs text-ink-300 mb-4">با کلیک روی هر دکمه، یک اعلان واقعی از طریق کانال مربوطه ارسال می‌شود. ایمیل، واتس‌اپ، بله و SMS کلاینت یا برنامه مربوطه را با پیام آماده باز می‌کنند.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-[11px] text-ink-300 mb-1 block">گیرنده آزمایش</label>
            <select className="input-dark" value={testTarget} onChange={e => setTestTarget(e.target.value)}>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
            </select>
            {targetUser && (
              <div className="mt-1 text-[10px] text-amber-300/80">
                📧 {targetUser.email} {targetUser.phone && `• 📱 ${targetUser.phone}`}
              </div>
            )}
          </div>
          <div>
            <label className="text-[11px] text-ink-300 mb-1 block">عنوان اعلان</label>
            <input className="input-dark" value={testTitle} onChange={e => setTestTitle(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] text-ink-300 mb-1 block">متن پیام</label>
            <textarea className="input-dark min-h-[60px]" value={testBody} onChange={e => setTestBody(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <TestBtn icon="Bell" label="درون‌برنامه‌ای" onClick={testInapp} />
          <TestBtn icon="Bell" label="اعلان مرورگر (Push)" onClick={testPush} disabled={permission !== 'granted'} />
          <TestBtn icon="Mail" label="ایمیل" onClick={testEmail} disabled={!targetUser?.email} />
          <TestBtn icon="Whatsapp" label="واتس‌اپ" onClick={testWhatsApp} disabled={!targetUser?.phone} color="emerald" />
          <TestBtn icon="Phone" label="بله Messenger" onClick={testBale} disabled={!targetUser?.phone} color="sky" />
          <TestBtn icon="Phone" label="پیامک (SMS)" onClick={testSMS} disabled={!targetUser?.phone} />
          <TestBtn icon="Bell" label="🔔 صدای اعلان" onClick={testSound} />
          <TestBtn icon="Alert" label="⚠ صدای هشدار" onClick={testSoundWarning} />
          <TestBtn icon="Alert" label="🚨 صدای بحرانی" onClick={testSoundCritical} />
          <TestBtn icon="Activity" label="📳 لرزش (موبایل)" onClick={testVibrate} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Preferences */}
        <div className="surface rounded-2xl p-5">
          <h4 className="font-bold mb-3 text-gold-gradient flex items-center gap-2">
            <I.Cog size={16} /> تنظیمات شخصی
          </h4>
          <div className="space-y-2 text-sm">
            <PrefRow label="🔔 پخش صدا هنگام دریافت اعلان" on={prefs.sound} onToggle={() => setPrefs({ ...prefs, sound: !prefs.sound })} />
            <PrefRow label="📳 لرزش (موبایل)" on={prefs.vibration} onToggle={() => setPrefs({ ...prefs, vibration: !prefs.vibration })} />
            <PrefRow label="🌐 اعلان مرورگر (Push)" on={prefs.push} onToggle={() => setPrefs({ ...prefs, push: !prefs.push })} />
          </div>

          <div className="mt-4">
            <div className="text-xs font-bold text-amber-300 mb-2">کانال‌های پیش‌فرض هنگام ایجاد اعلان جدید:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['inapp', 'push', 'email', 'whatsapp', 'bale', 'sms'] as DeliveryChannel[]).map(ch => {
                const labels: Record<DeliveryChannel, string> = {
                  inapp: 'درون‌برنامه‌ای', push: 'مرورگر', email: 'ایمیل',
                  whatsapp: 'واتس‌اپ', bale: 'بله', sms: 'پیامک',
                };
                const on = prefs.defaultChannels.includes(ch);
                return (
                  <button key={ch} onClick={() => toggleChannel(ch)}
                    className={`px-2 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition ${on ? 'btn-gold' : 'btn-ghost-gold'}`}>
                    {on ? <I.Check size={11} /> : null}
                    {labels[ch]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Escalation rules */}
        <div className="surface rounded-2xl p-5">
          <h4 className="font-bold mb-3 text-gold-gradient flex items-center gap-2">
            <I.Alert size={16} /> قوانین تشدید (Escalation)
          </h4>
          <div className="space-y-2 text-xs">
            {[
              { l: 'تأخیر ۱ ساعت', a: 'اطلاع به تکنسین مربوطه', c: 'amber' },
              { l: 'تأخیر ۴ ساعت', a: 'اطلاع به سرپرست', c: 'amber' },
              { l: 'تأخیر ۸ ساعت', a: 'اطلاع به مدیر تعمیرات', c: 'rose' },
              { l: 'تأخیر ۲۴ ساعت', a: 'اطلاع به ادمین + تولید گزارش', c: 'rose' },
            ].map((s, i) => (
              <div key={i} className="surface-soft rounded-lg p-2.5 flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${s.c === 'rose' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>{faNum(i + 1)}</div>
                <span className={`font-semibold ${s.c === 'rose' ? 'text-rose-300' : 'text-amber-300'}`}>{s.l}</span>
                <span className="text-ink-300">←</span>
                <span className="flex-1">{s.a}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-ink-400 mt-3">قوانین فوق به‌صورت خودکار بر اساس اولویت دستور کار اعمال می‌شوند.</p>
        </div>
      </div>

      {/* History */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-amber-500/15 flex items-center justify-between">
          <h4 className="font-bold text-gold-gradient">تاریخچه اعلانات ({faNum(notifications.length)})</h4>
          <button onClick={markAllNotificationsRead} className="text-xs text-amber-300 hover:text-amber-200">علامت‌گذاری همه به‌عنوان خوانده‌شده</button>
        </div>
        <div className="divide-y divide-amber-500/10 max-h-[500px] overflow-y-auto">
          {notifications.length === 0 && (
            <div className="text-center py-10 text-sm text-ink-400">هیچ اعلانی موجود نیست</div>
          )}
          {notifications.map(n => (
            <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`block w-full text-right px-4 py-3 hover:bg-amber-500/5 transition ${!n.read ? 'bg-amber-500/5' : ''}`}>
              <div className="flex items-start gap-3">
                {!n.read && <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0 pulse-gold" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm">{n.title}</span>
                    <span className="text-[11px] text-amber-300/80 shrink-0">{timeAgo(n.at)}</span>
                  </div>
                  <div className="text-xs text-ink-300 mt-1 leading-5">{n.body}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {n.channel.map(c => <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80">{c}</span>)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestBtn({ icon, label, onClick, disabled, color }: { icon: keyof typeof I; label: string; onClick: () => void; disabled?: boolean; color?: 'emerald' | 'sky' }) {
  const Icon = I[icon];
  const base = disabled
    ? 'opacity-40 cursor-not-allowed border-ink-700'
    : color === 'emerald' ? 'border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10'
      : color === 'sky' ? 'border-sky-400/40 text-sky-200 hover:bg-sky-500/10'
        : 'border-amber-400/40 text-amber-200 hover:bg-amber-500/10';
  return (
    <button onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border transition ${base}`}>
      <Icon size={14} />
      {label}
    </button>
  );
}

function PrefRow({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="surface-soft rounded-lg p-3 flex items-center gap-3">
      <span className="flex-1">{label}</span>
      <button onClick={onToggle} className="relative inline-flex items-center cursor-pointer">
        <div className={`w-10 h-5 rounded-full transition ${on ? 'bg-amber-500' : 'bg-ink-700'} relative`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${on ? 'right-0.5' : 'right-[22px]'}`} />
        </div>
      </button>
    </div>
  );
}
