import { useState, useRef } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { Donut } from '../components/Charts';
import { faNum, formatJalali } from '../lib/utils';
import { validatePassword, verifyPassword } from '../lib/auth';
import type { User } from '../lib/types';

export function ProfilePage() {
  const { currentUser, updateUser, changePassword, logout } = useApp();
  const toast = useToast();
  const [form, setForm] = useState<User | null>(currentUser);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentUser?.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!currentUser || !form) {
    return <div className="surface rounded-2xl p-10 text-center text-ink-400">ابتدا وارد سامانه شوید</div>;
  }

  const update = (patch: Partial<User>) => setForm({ ...form, ...patch });

  const save = () => {
    if (!form.name.trim()) { toast.push('نام را وارد کنید', 'error'); return; }
    if (!form.email.trim()) { toast.push('ایمیل را وارد کنید', 'error'); return; }
    updateUser(form.id, { ...form, avatar: avatarPreview });
    toast.push('پروفایل با موفقیت ذخیره شد', 'success');
  };

  const handleAvatar = (file: File | null) => {
    if (!file) return;
    if (file.size > 500_000) { toast.push('حجم تصویر باید کمتر از ۵۰۰ کیلوبایت باشد', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      toast.push('تصویر بارگذاری شد — برای اعمال، روی «ذخیره» کلیک کنید', 'info');
    };
    reader.readAsDataURL(file);
  };

  const doChangePassword = async () => {
    const v = validatePassword(newPwd);
    if (!v.ok) { toast.push(v.message!, 'error'); return; }
    if (newPwd !== newPwd2) { toast.push('تکرار رمز عبور مطابقت ندارد', 'error'); return; }
    const verify = await verifyPassword(oldPwd, currentUser.passwordHash);
    if (!verify) { toast.push('رمز عبور فعلی نادرست است', 'error'); return; }
    await changePassword(currentUser.id, newPwd);
    toast.push('رمز عبور با موفقیت تغییر یافت', 'success');
    setPwdOpen(false);
    setOldPwd(''); setNewPwd(''); setNewPwd2('');
  };

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header card */}
      <div className="surface ring-gold rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="relative flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative">
            <button onClick={() => fileRef.current?.click()} className="group relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt={form.name} className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/40" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-display text-4xl text-ink-900 border-2 border-amber-400/40">
                  {form.name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <I.Camera className="text-amber-300" />
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatar(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display text-2xl text-gold-gradient">{form.name}</h2>
              <span className={`pill ${isAdmin ? 'bg-rose-500/15 text-rose-200 border-rose-500/30' : 'bg-amber-500/15 text-amber-200 border-amber-500/30'}`}>
                {form.role === 'admin' ? '👑 مدیر سیستم' :
                  form.role === 'manager' ? 'مدیر' :
                    form.role === 'supervisor' ? 'سرپرست' :
                      form.role === 'technician' ? 'تکنسین' :
                        form.role === 'operator' ? 'اپراتور' : 'بازدیدکننده'}
              </span>
              {form.active && <span className="pill bg-emerald-500/15 text-emerald-200 border-emerald-500/30">فعال</span>}
            </div>
            <p className="text-sm text-amber-300/80 mt-1">{form.jobTitle} — {form.department}</p>
            <div className="mt-3 flex items-center gap-4 text-xs text-ink-300 flex-wrap">
              <span className="flex items-center gap-1.5"><I.Mail size={12} className="text-amber-400" />{form.email}</span>
              {form.phone && <span className="flex items-center gap-1.5"><I.Phone size={12} className="text-amber-400" />{form.phone}</span>}
              <span className="flex items-center gap-1.5"><I.Calendar size={12} className="text-amber-400" />عضویت از {formatJalali(form.joinedAt)}</span>
              {form.lastLoginAt && <span className="flex items-center gap-1.5"><I.Activity size={12} className="text-amber-400" />آخرین ورود: {formatJalali(form.lastLoginAt, true)}</span>}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Donut value={form.performance} size={88} label="عملکرد" />
            <div className="text-[10px] text-ink-300 mt-1">امتیاز AI</div>
          </div>
        </div>
      </div>

      {/* Editable fields */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gold-gradient flex items-center gap-2">
            <I.Edit size={16} /> اطلاعات شخصی (قابل ویرایش)
          </h3>
          <button onClick={save} className="btn-gold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <I.Check size={12} /> ذخیره تغییرات
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <PF label="نام و نام خانوادگی *" value={form.name} onChange={v => update({ name: v })} />
          <PF label="ایمیل سازمانی *" value={form.email} onChange={v => update({ email: v })} type="email" />
          <PF label="شماره تماس" value={form.phone} onChange={v => update({ phone: v })} placeholder="۰۹۱۲..." />
          <PF label="سمت / عنوان شغلی" value={form.jobTitle} onChange={v => update({ jobTitle: v })} />
          <PF label="دپارتمان" value={form.department} onChange={v => update({ department: v })} />
          <PF label="تاریخ عضویت" value={form.joinedAt.slice(0, 10)} onChange={v => update({ joinedAt: v })} type="date" />
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-[11px] text-ink-300 mb-1 block">مهارت‌ها (با کاما/«،» جدا کنید)</label>
            <input className="input-dark" value={form.skills.join('، ')}
              onChange={e => update({ skills: e.target.value.split(/[،,]/).map(s => s.trim()).filter(Boolean) })} />
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills.map(s => <span key={s} className="pill bg-amber-500/10 text-amber-200 border-amber-500/20">{s}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gold-gradient flex items-center gap-2">
            <I.Shield size={16} /> گواهینامه‌ها و مدارک
          </h3>
          <button onClick={() => update({ certifications: [...form.certifications, { name: '', expiry: new Date().toISOString().slice(0, 10) }] })}
            className="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <I.Plus size={12} /> افزودن
          </button>
        </div>
        <div className="space-y-2">
          {form.certifications.map((c, i) => (
            <div key={i} className="surface-soft rounded-lg p-3 flex items-center gap-2">
              <input className="input-dark flex-1" placeholder="نام گواهینامه" value={c.name}
                onChange={e => update({ certifications: form.certifications.map((x, j) => j === i ? { ...x, name: e.target.value } : x) })} />
              <input type="date" className="input-dark w-40" value={c.expiry}
                onChange={e => update({ certifications: form.certifications.map((x, j) => j === i ? { ...x, expiry: e.target.value } : x) })} />
              <button onClick={() => update({ certifications: form.certifications.filter((_, j) => j !== i) })}
                className="p-2 rounded text-rose-300 hover:bg-rose-500/10"><I.Trash size={14} /></button>
            </div>
          ))}
          {form.certifications.length === 0 && <div className="text-center py-6 text-xs text-ink-400">گواهینامه‌ای ثبت نشده</div>}
        </div>
      </div>

      {/* Security */}
      <div className="surface rounded-2xl p-5">
        <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
          <I.Shield size={16} /> امنیت حساب
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="surface-soft rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-300"><I.Shield size={20} /></div>
              <div className="flex-1">
                <div className="font-bold text-sm">رمز عبور</div>
                <div className="text-[11px] text-ink-400 mt-0.5">رمز خود را دوره‌ای تغییر دهید</div>
              </div>
            </div>
            <button onClick={() => setPwdOpen(true)} className="btn-gold w-full mt-3 py-2 rounded-lg text-xs">تغییر رمز عبور</button>
          </div>

          <div className="surface-soft rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300"><I.Check size={20} /></div>
              <div className="flex-1">
                <div className="font-bold text-sm">وضعیت حساب</div>
                <div className="text-[11px] text-emerald-300 mt-0.5">فعال و امن</div>
              </div>
            </div>
            <div className="mt-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-ink-400">روش ورود:</span><span>{form.loginProvider === 'google' ? 'حساب گوگل' : 'رمز عبور'}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">شناسه:</span><span className="font-mono text-[10px]">{form.id.slice(0, 12)}</span></div>
            </div>
          </div>

          <div className="surface-soft rounded-xl p-4 border-2 border-rose-400/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-300"><I.Logout size={20} /></div>
              <div className="flex-1">
                <div className="font-bold text-sm text-rose-200">خروج از حساب</div>
                <div className="text-[11px] text-ink-400 mt-0.5">از سامانه خارج شوید</div>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm('آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟')) {
                  logout();
                  toast.push('با موفقیت خارج شدید', 'info');
                }
              }}
              className="w-full mt-3 py-2 rounded-lg text-xs border border-rose-400/40 text-rose-200 hover:bg-rose-500/15 transition flex items-center justify-center gap-1.5"
            >
              <I.Logout size={12} /> خروج از سامانه
            </button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="surface rounded-2xl p-5 border-2 border-amber-500/30">
          <h3 className="font-bold text-gold-gradient mb-3 flex items-center gap-2">
            <I.Spark size={16} /> 👑 امتیازات مدیر سیستم
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {[
              'مدیریت کامل تمام کاربران',
              'تأیید درخواست‌های عضویت',
              'بازنشانی رمز عبور سایر کاربران',
              'ویرایش اطلاعات شرکت',
              'دسترسی به لاگ‌های ممیزی کامل',
              'پشتیبان‌گیری و بازنشانی سیستم',
              'تغییر نقش کاربران',
              'مدیریت تنظیمات سیستم',
              'دسترسی به همه ماژول‌ها',
            ].map(p => (
              <div key={p} className="surface-soft rounded-lg p-2 flex items-start gap-2">
                <I.Check size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat k="ID" v={form.id.slice(0, 8) + '…'} />
        <Stat k="مهارت‌ها" v={faNum(form.skills.length)} />
        <Stat k="گواهینامه‌ها" v={faNum(form.certifications.length)} />
        <Stat k="امتیاز AI" v={faNum(form.performance) + '/۱۰۰'} />
      </div>

      {/* Password modal */}
      <Modal open={pwdOpen} onClose={() => setPwdOpen(false)} title="تغییر رمز عبور" size="sm"
        footer={<>
          <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setPwdOpen(false)}>انصراف</button>
          <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={doChangePassword}>تغییر رمز</button>
        </>}>
        <div className="space-y-3 text-sm">
          <Field label="رمز عبور فعلی" value={oldPwd} onChange={setOldPwd} />
          <Field label="رمز عبور جدید (حداقل ۶ کاراکتر)" value={newPwd} onChange={setNewPwd} />
          <Field label="تکرار رمز عبور جدید" value={newPwd2} onChange={setNewPwd2} />
        </div>
      </Modal>
    </div>
  );
}

function PF({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-[11px] text-ink-300 mb-1 block">{label}</label>
      <input type={type} className="input-dark" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-ink-300 mb-1.5 block">{label}</label>
      <input type="password" className="input-dark" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="surface rounded-xl p-3 text-center">
      <div className="text-[10px] text-ink-400">{k}</div>
      <div className="font-display text-base text-gold-gradient mt-1">{v}</div>
    </div>
  );
}
