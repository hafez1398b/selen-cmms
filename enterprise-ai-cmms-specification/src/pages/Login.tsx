import { useState } from 'react';
import { useApp } from '../lib/store';
import { Logo } from '../components/Logo';
import { I } from '../components/Icon';
import { useToast } from '../components/Toast';
import { faNum } from '../lib/utils';
import { validateEmail, validatePassword } from '../lib/auth';
import { Modal } from '../components/Modal';

type Mode = 'login' | 'signup' | 'forgot';

export function LoginPage() {
  const { loginWithPassword, addPendingRequest, company, currentUser, changePassword } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('تولید');
  const [jobTitle, setJobTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [forceChange, setForceChange] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const toast = useToast();

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { toast.push('ایمیل نامعتبر است', 'error'); return; }
    if (!password) { toast.push('رمز عبور را وارد کنید', 'error'); return; }
    setLoading(true);
    const res = await loginWithPassword(email, password);
    setLoading(false);
    if (!res.ok) {
      toast.push(res.message ?? 'خطا در ورود', 'error');
      return;
    }
    if (res.mustChange) {
      setForceChange(true);
      toast.push('لطفاً رمز عبور خود را تغییر دهید', 'warning');
    } else {
      toast.push('ورود موفق — خوش آمدید', 'success');
    }
  };

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) { toast.push('نام را وارد کنید', 'error'); return; }
    if (!validateEmail(email)) { toast.push('ایمیل نامعتبر است', 'error'); return; }
    addPendingRequest({ type: 'signup', name, email, phone, department, jobTitle, message });
    toast.push('درخواست شما برای ادمین ارسال شد. پس از تأیید با شما تماس گرفته می‌شود.', 'success');
    setMode('login');
    setName(''); setPhone(''); setJobTitle(''); setMessage('');
  };

  const submitForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) { toast.push('ایمیل نامعتبر است', 'error'); return; }
    addPendingRequest({ type: 'password_reset', name: email.split('@')[0], email, message: 'درخواست بازنشانی رمز عبور' });
    toast.push('درخواست بازنشانی رمز برای ادمین ارسال شد', 'info');
    setMode('login');
  };

  const googleSignIn = () => {
    if (!email || !validateEmail(email)) { toast.push('ایمیل گوگل خود را در فیلد ایمیل وارد کنید', 'warning'); return; }
    addPendingRequest({ type: 'google_login', name: email.split('@')[0], email, message: 'درخواست ورود با حساب گوگل' });
    toast.push('درخواست ورود با گوگل برای تأیید ادمین ارسال شد', 'info');
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validatePassword(newPwd);
    if (!v.ok) { toast.push(v.message!, 'error'); return; }
    if (newPwd !== newPwd2) { toast.push('تکرار رمز عبور مطابقت ندارد', 'error'); return; }
    if (!currentUser) return;
    await changePassword(currentUser.id, newPwd);
    setForceChange(false);
    toast.push('رمز عبور با موفقیت تغییر یافت', 'success');
  };

  return (
    <>
      <div className="min-h-screen flex items-stretch">
        {/* Side panel */}
        <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden p-12 items-start justify-between">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(800px 600px at 30% 20%, rgba(245,158,11,0.18), transparent 60%), linear-gradient(135deg, #06060a 0%, #1f1f25 100%)'
          }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 400 400">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffcb4d" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <div className="relative z-10 flex items-center gap-4">
            <div className="relative float-slow">
              <Logo size={88} variant="full" />
              <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-2xl -z-10" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-gold-gradient">{company.nameEn.toUpperCase()}</h1>
              <p className="text-amber-300/70 text-sm mt-1">{company.name}</p>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="inline-flex pill bg-amber-500/15 text-amber-200 border-amber-500/25 mb-4">
              <I.Spark size={12} /> نسخه ۲٫۰ — سازمانی
            </div>
            <h2 className="font-display text-4xl text-gold-gradient leading-tight">
              پلتفرم هوشمند<br />نگهداری و تعمیرات
            </h2>
            <p className="text-ink-200 mt-4 leading-7">{company.description}</p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat k="تجهیز ثبت‌شده" v={faNum(2340)} />
              <Stat k="دستور کار / ماه" v={faNum(186)} />
              <Stat k="انطباق PM" v={faNum(94) + '٪'} />
            </div>
          </div>

          <div className="relative z-10 text-xs text-ink-400">
            © {faNum(1403)} {company.name} — تمامی حقوق محفوظ است.
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 max-w-xl mx-auto w-full">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
              <div className="relative">
                <Logo size={96} variant="full" />
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-2xl -z-10" />
              </div>
              <h1 className="font-display text-2xl text-gold-gradient">{company.name}</h1>
            </div>

            <div className="surface ring-gold rounded-2xl p-7">
              {/* Tabs */}
              <div className="flex rounded-xl overflow-hidden border border-amber-500/25 mb-5">
                {([
                  { k: 'login', l: 'ورود' },
                  { k: 'signup', l: 'ثبت‌نام' },
                  { k: 'forgot', l: 'فراموشی رمز' },
                ] as { k: Mode; l: string }[]).map(t => (
                  <button key={t.k} onClick={() => setMode(t.k)}
                    className={`flex-1 py-2 text-xs font-bold transition ${mode === t.k ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'}`}>
                    {t.l}
                  </button>
                ))}
              </div>

              {mode === 'login' && (
                <form onSubmit={submitLogin} className="space-y-4">
                  <h2 className="font-bold text-xl text-ink-50">ورود به حساب کاربری</h2>
                  <p className="text-sm text-ink-300 -mt-2">با حساب سازمانی خود وارد شوید</p>

                  <Field label="ایمیل سازمانی" icon="Mail">
                    <input className="input-dark pr-10" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@basparfoam.ir" />
                  </Field>
                  <Field label="رمز عبور" icon="Shield">
                    <input className="input-dark pr-10" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} />
                  </Field>

                  <button type="submit" disabled={loading} className="btn-gold w-full py-3 rounded-xl text-sm font-bold disabled:opacity-60">
                    {loading ? 'در حال بررسی...' : 'ورود به سامانه'}
                  </button>

                  <Divider />

                  <button type="button" onClick={googleSignIn}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold border border-amber-500/25 text-ink-100 hover:bg-amber-500/5 flex items-center justify-center gap-2 transition">
                    <GoogleIcon />
                    ورود با حساب گوگل (نیاز به تأیید ادمین)
                  </button>

                  <div className="text-[11px] text-amber-300/80 surface-soft rounded-lg p-3 leading-6">
                    💡 <strong>راهنما:</strong> برای دسترسی به سامانه، ابتدا از ادمین درخواست عضویت کنید یا با حساب موجود وارد شوید.
                    رمز عبور پیش‌فرض برای کاربران آزمایشی: <code className="bg-amber-500/15 px-1.5 py-0.5 rounded font-mono">Baspar@1234</code>
                  </div>
                </form>
              )}

              {mode === 'signup' && (
                <form onSubmit={submitSignup} className="space-y-3">
                  <h2 className="font-bold text-xl text-ink-50">درخواست عضویت</h2>
                  <p className="text-sm text-ink-300 -mt-2">پس از ارسال، ادمین درخواست را بررسی و تأیید می‌کند.</p>

                  <Field label="نام و نام خانوادگی" icon="Users">
                    <input className="input-dark pr-10" value={name} onChange={e => setName(e.target.value)} />
                  </Field>
                  <Field label="ایمیل" icon="Mail">
                    <input className="input-dark pr-10" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <Field label="شماره تماس" icon="Phone">
                    <input className="input-dark pr-10" value={phone} onChange={e => setPhone(e.target.value)} placeholder="۰۹۱۲..." />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="دپارتمان" icon="Factory">
                      <select className="input-dark pr-10" value={department} onChange={e => setDepartment(e.target.value)}>
                        <option>تولید</option><option>مکانیک</option><option>برق</option>
                        <option>تأسیسات</option><option>انبار</option><option>کیفیت</option>
                        <option>HSE</option><option>مدیریت</option>
                      </select>
                    </Field>
                    <Field label="سمت" icon="Wrench">
                      <input className="input-dark pr-10" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </Field>
                  </div>
                  <Field label="پیام/توضیحات" icon="Edit">
                    <textarea className="input-dark pr-10 min-h-[70px]" value={message} onChange={e => setMessage(e.target.value)} />
                  </Field>

                  <button type="submit" className="btn-gold w-full py-3 rounded-xl text-sm font-bold">ارسال درخواست</button>
                </form>
              )}

              {mode === 'forgot' && (
                <form onSubmit={submitForgot} className="space-y-4">
                  <h2 className="font-bold text-xl text-ink-50">فراموشی رمز عبور</h2>
                  <p className="text-sm text-ink-300 -mt-2">ایمیل خود را وارد کنید تا ادمین رمز جدید تنظیم کند.</p>
                  <Field label="ایمیل" icon="Mail">
                    <input className="input-dark pr-10" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </Field>
                  <button type="submit" className="btn-gold w-full py-3 rounded-xl text-sm font-bold">ارسال درخواست</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Force password change */}
      <Modal open={forceChange} onClose={() => { /* prevent close */ }} title="تغییر اجباری رمز عبور" size="sm">
        <form onSubmit={submitNewPassword} className="space-y-3">
          <p className="text-sm text-amber-200 surface-soft p-3 rounded-lg">
            🔒 برای ادامه، باید رمز عبور پیش‌فرض را تغییر دهید.
          </p>
          <Field label="رمز عبور جدید (حداقل ۶ کاراکتر)" icon="Shield">
            <input type="password" className="input-dark pr-10" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
          </Field>
          <Field label="تکرار رمز عبور" icon="Shield">
            <input type="password" className="input-dark pr-10" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} />
          </Field>
          <button type="submit" className="btn-gold w-full py-2.5 rounded-xl text-sm font-bold">تغییر رمز و ورود</button>
        </form>
      </Modal>
    </>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="surface rounded-xl p-3 text-center">
      <div className="font-display text-xl text-gold-gradient">{v}</div>
      <div className="text-[11px] text-ink-300 mt-1">{k}</div>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: keyof typeof I; children: React.ReactNode }) {
  const Icon = I[icon];
  return (
    <div>
      <label className="text-xs text-ink-300 mb-1.5 block">{label}</label>
      <div className="relative">
        <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/70" size={16} />
        {children}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 gold-divider" />
      <span className="text-[11px] text-ink-400">یا</span>
      <div className="flex-1 gold-divider" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.8 6.1 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.1z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.8-2 13.3-5.2l-6.1-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.4-11.3-8l-6.5 5c3.3 5.9 9.9 11.2 17.8 11.2z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.1 5.2c-.4.4 6.7-4.9 6.7-14.8 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
