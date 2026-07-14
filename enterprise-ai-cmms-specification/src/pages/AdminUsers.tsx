import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { faNum, formatJalali, timeAgo } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { validatePassword } from '../lib/auth';
import type { User, Role, PendingRequest } from '../lib/types';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'مدیر سیستم', manager: 'مدیر', supervisor: 'سرپرست',
  technician: 'تکنسین', operator: 'اپراتور', viewer: 'بازدیدکننده'
};

export function AdminUsersPage() {
  const { currentUser, users, pendingRequests, approveRequest, rejectRequest, resetUserPassword, updateUser, removeUser } = useApp();
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [approveTarget, setApproveTarget] = useState<PendingRequest | null>(null);
  const [approveRole, setApproveRole] = useState<Role>('technician');
  const [approvePassword, setApprovePassword] = useState('Baspar@1234');
  const [delUser, setDelUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const isAdmin = currentUser?.role === 'admin';

  const pendingList = useMemo(() => pendingRequests.filter(r => r.status === 'pending'), [pendingRequests]);
  const historyList = useMemo(() => pendingRequests.filter(r => r.status !== 'pending').slice(0, 20), [pendingRequests]);

  const filtered = useMemo(() => users.filter(u =>
    !search || u.name.includes(search) || u.email.includes(search) || u.phone.includes(search)
  ), [users, search]);

  if (!isAdmin) {
    return (
      <div className="surface rounded-2xl p-10 text-center">
        <I.Shield size={48} className="mx-auto text-amber-400 mb-3" />
        <h3 className="font-bold text-lg text-gold-gradient">دسترسی محدود</h3>
        <p className="text-sm text-ink-300 mt-2">این بخش فقط برای مدیر سیستم در دسترس است.</p>
      </div>
    );
  }

  const doResetPassword = async () => {
    if (!resetTarget) return;
    const v = validatePassword(newPassword);
    if (!v.ok) { toast.push(v.message!, 'error'); return; }
    await resetUserPassword(resetTarget.id, newPassword);
    toast.push(`رمز عبور «${resetTarget.name}» بازنشانی شد. کاربر در ورود بعدی باید آن را تغییر دهد.`, 'success');
    setResetTarget(null);
    setNewPassword('');
  };

  const doApprove = async () => {
    if (!approveTarget) return;
    const v = validatePassword(approvePassword);
    if (!v.ok) { toast.push(v.message!, 'error'); return; }
    await approveRequest(approveTarget.id, approveRole, approvePassword);
    toast.push(`درخواست «${approveTarget.name}» تأیید و حساب کاربری ساخته شد`, 'success');
    setApproveTarget(null);
    setApprovePassword('Baspar@1234');
    setApproveRole('technician');
  };

  const doDelete = (u: User) => {
    try {
      removeUser(u.id);
      toast.push(`کاربر «${u.name}» حذف شد`, 'info');
    } catch (e) {
      toast.push((e as Error).message, 'error');
    }
    setDelUser(null);
  };

  const toggleActive = (u: User) => {
    updateUser(u.id, { active: !u.active });
    toast.push(u.active ? `«${u.name}» غیرفعال شد` : `«${u.name}» فعال شد`);
  };

  const changeRole = (u: User, role: Role) => {
    updateUser(u.id, { role });
    toast.push(`نقش «${u.name}» به ${ROLE_LABEL[role]} تغییر یافت`);
  };

  return (
    <div className="space-y-4">
      {/* Pending Requests */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gold-gradient flex items-center gap-2">
            <I.Bell size={16} /> درخواست‌های در انتظار تأیید
          </h3>
          <span className="pill bg-amber-500/15 text-amber-200">{faNum(pendingList.length)} درخواست</span>
        </div>

        {pendingList.length === 0 ? (
          <div className="text-center py-8 text-sm text-ink-400">
            <I.Check size={32} className="mx-auto text-emerald-400 mb-2" />
            هیچ درخواست در انتظاری وجود ندارد
          </div>
        ) : (
          <div className="space-y-2">
            {pendingList.map(r => (
              <div key={r.id} className="surface-soft rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    r.type === 'google_login' ? 'bg-sky-500/15 text-sky-300' :
                      r.type === 'password_reset' ? 'bg-amber-500/15 text-amber-300' :
                        'bg-emerald-500/15 text-emerald-300'
                  }`}>
                    {r.type === 'google_login' ? '🔵' : r.type === 'password_reset' ? '🔑' : '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold">{r.name}</h4>
                      <span className="pill bg-amber-500/10 text-amber-200">
                        {r.type === 'signup' ? 'عضویت جدید' : r.type === 'google_login' ? 'ورود با گوگل' : 'بازنشانی رمز'}
                      </span>
                      <span className="text-[11px] text-ink-400">{timeAgo(r.at)}</span>
                    </div>
                    <div className="text-xs text-ink-300 mt-1">
                      📧 {r.email} {r.phone && `• 📱 ${r.phone}`}
                    </div>
                    {(r.department || r.jobTitle) && (
                      <div className="text-xs text-amber-300/80 mt-1">
                        {r.department} {r.jobTitle && `— ${r.jobTitle}`}
                      </div>
                    )}
                    {r.message && (
                      <div className="text-xs text-ink-200 mt-2 p-2 bg-ink-900/30 rounded">{r.message}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {(r.type === 'signup' || r.type === 'google_login') ? (
                      <button onClick={() => setApproveTarget(r)} className="btn-gold px-3 py-1.5 rounded-lg text-xs">تأیید و ساخت حساب</button>
                    ) : (
                      <button onClick={() => {
                        const u = users.find(x => x.email === r.email);
                        if (u) { setResetTarget(u); rejectRequest(r.id); }
                        else { toast.push('کاربری با این ایمیل یافت نشد', 'error'); }
                      }} className="btn-gold px-3 py-1.5 rounded-lg text-xs">تنظیم رمز جدید</button>
                    )}
                    <button onClick={() => { rejectRequest(r.id); toast.push('درخواست رد شد', 'info'); }}
                      className="px-3 py-1.5 rounded-lg text-xs border border-rose-400/30 text-rose-300 hover:bg-rose-500/10">رد</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <h3 className="font-bold text-gold-gradient flex items-center gap-2">
            <I.Users size={16} /> مدیریت کامل کاربران
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
              <input className="input-dark pr-8 py-1.5 text-xs" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-500/5 text-amber-300 text-xs">
              <tr>
                <th className="px-3 py-3 text-right">کاربر</th>
                <th className="px-3 py-3 text-right">ایمیل</th>
                <th className="px-3 py-3 text-right">نقش</th>
                <th className="px-3 py-3 text-right">دپارتمان</th>
                <th className="px-3 py-3 text-right">آخرین ورود</th>
                <th className="px-3 py-3 text-right">وضعیت</th>
                <th className="px-3 py-3 text-right">عملیات ادمین</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-500/10">
              {filtered.map(u => (
                <tr key={u.id} className={`hover:bg-amber-500/5 ${!u.active ? 'opacity-60' : ''}`}>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900 text-xs">{u.name.charAt(0)}</div>
                      <div>
                        <div className="font-bold text-sm">{u.name}</div>
                        <div className="text-[10px] text-ink-400">{u.jobTitle}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{u.email}</td>
                  <td className="px-3 py-2.5">
                    <select value={u.role} onChange={e => changeRole(u, e.target.value as Role)} disabled={u.id === currentUser?.id}
                      className="input-dark py-1 text-xs">
                      {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5 text-xs">{u.department}</td>
                  <td className="px-3 py-2.5 text-xs">{u.lastLoginAt ? formatJalali(u.lastLoginAt, true) : <span className="text-ink-500">هرگز</span>}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {u.active
                      ? <span className="pill bg-emerald-500/15 text-emerald-200">فعال</span>
                      : <span className="pill bg-rose-500/15 text-rose-200">غیرفعال</span>}
                    {u.mustChangePassword && <span className="pill bg-amber-500/15 text-amber-200 mr-1">رمز جدید</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setResetTarget(u); setNewPassword('Baspar@' + Math.floor(Math.random() * 9000 + 1000)); }}
                        className="px-2 py-1 rounded text-[11px] btn-ghost-gold flex items-center gap-1" title="بازنشانی رمز">
                        <I.Shield size={10} /> رمز
                      </button>
                      <button onClick={() => toggleActive(u)}
                        className="px-2 py-1 rounded text-[11px] btn-ghost-gold" disabled={u.id === currentUser?.id}>
                        {u.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                      </button>
                      <button onClick={() => setDelUser(u)}
                        className="p-1 rounded hover:bg-rose-500/10 text-rose-300" disabled={u.id === currentUser?.id}>
                        <I.Trash size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* History */}
      {historyList.length > 0 && (
        <div className="surface rounded-2xl p-5">
          <h3 className="font-bold text-gold-gradient mb-3">تاریخچه درخواست‌های اخیر</h3>
          <div className="space-y-1.5">
            {historyList.map(r => (
              <div key={r.id} className="surface-soft rounded-lg p-2.5 flex items-center gap-3 text-xs">
                <span className={`pill ${r.status === 'approved' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-rose-500/15 text-rose-200'}`}>
                  {r.status === 'approved' ? '✓ تأیید‌شده' : '✗ رد‌شده'}
                </span>
                <span className="font-bold">{r.name}</span>
                <span className="text-ink-400">— {r.email}</span>
                <span className="flex-1" />
                <span className="text-ink-400">توسط {r.reviewedBy ?? '—'}</span>
                <span className="text-ink-400">{r.reviewedAt && timeAgo(r.reviewedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetTarget && (
        <Modal open={true} onClose={() => setResetTarget(null)} title={`بازنشانی رمز عبور — ${resetTarget.name}`} size="sm"
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setResetTarget(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={doResetPassword}>تنظیم رمز</button>
          </>}>
          <div className="space-y-3">
            <p className="text-sm text-amber-200 surface-soft p-3 rounded-lg">
              🔒 رمز جدید را تنظیم کنید. کاربر باید در ورود بعدی آن را تغییر دهد.
            </p>
            <div>
              <label className="text-xs text-ink-300 mb-1.5 block">رمز عبور موقت</label>
              <input type="text" className="input-dark font-mono" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <p className="text-[11px] text-ink-400 mt-1">حداقل ۶ کاراکتر — این رمز را به کاربر اعلام کنید.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Approve modal */}
      {approveTarget && (
        <Modal open={true} onClose={() => setApproveTarget(null)} title={`تأیید درخواست — ${approveTarget.name}`} size="sm"
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setApproveTarget(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={doApprove}>ساخت حساب کاربری</button>
          </>}>
          <div className="space-y-3">
            <div className="surface-soft p-3 rounded-lg text-sm space-y-1">
              <div>📧 {approveTarget.email}</div>
              {approveTarget.phone && <div>📱 {approveTarget.phone}</div>}
              {approveTarget.department && <div>🏭 {approveTarget.department}</div>}
            </div>
            <div>
              <label className="text-xs text-ink-300 mb-1.5 block">نقش کاربر</label>
              <select className="input-dark" value={approveRole} onChange={e => setApproveRole(e.target.value as Role)}>
                {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-ink-300 mb-1.5 block">رمز عبور اولیه</label>
              <input type="text" className="input-dark font-mono" value={approvePassword} onChange={e => setApprovePassword(e.target.value)} />
              <p className="text-[11px] text-ink-400 mt-1">این رمز را به کاربر اعلام کنید. در ورود اول باید تغییر یابد.</p>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!delUser} onClose={() => setDelUser(null)} title="حذف کاربر"
        message={`آیا از حذف کامل «${delUser?.name}» اطمینان دارید؟ این عمل قابل بازگشت نیست.`}
        onConfirm={() => delUser && doDelete(delUser)} />
    </div>
  );
}
