import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from '../components/Icon';
import { uid, formatJalali, downloadCSV } from '../lib/utils';
import { Modal, ConfirmDialog } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Donut, Sparkline } from '../components/Charts';
import { AIInsightCard } from '../components/AIInsightCard';
import { ImportWizard } from '../components/ImportWizard';
import { PersonnelAttendance } from '../components/PersonnelAttendance';
import { analyzePersonnel } from '../lib/ai';
import type { User, Role } from '../lib/types';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'مدیر سیستم', manager: 'مدیر', supervisor: 'سرپرست',
  technician: 'تکنسین', operator: 'اپراتور', viewer: 'بازدیدکننده'
};

export function PersonnelPage() {
  const { users, addUser, updateUser, removeUser, workOrders } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<Role | ''>('');
  const [editing, setEditing] = useState<User | null>(null);
  const [del, setDel] = useState<User | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [tab, setTab] = useState<'list' | 'attendance'>('list');
  const toast = useToast();

  const filtered = useMemo(() => users.filter(u =>
    (!search || u.name.includes(search) || u.email.includes(search) || u.jobTitle.includes(search)) &&
    (!filterRole || u.role === filterRole)
  ), [users, search, filterRole]);

  const insights = useMemo(() => analyzePersonnel(users, workOrders), [users, workOrders]);

  const openNew = () => setEditing({
    id: uid('u'), name: '', email: '', role: 'technician', department: 'مکانیک', jobTitle: '',
    phone: '', skills: [], certifications: [], performance: 80, active: true, joinedAt: new Date().toISOString().slice(0, 10),
    passwordHash: '', loginProvider: 'password', mustChangePassword: true,
  });

  const save = async () => {
    if (!editing) return;
    if (!editing.name || !editing.email) { toast.push('نام و ایمیل الزامی است', 'error'); return; }
    if (users.some(u => u.id === editing.id)) {
      updateUser(editing.id, editing);
      toast.push('ذخیره شد');
    } else {
      // For new users, use a default temporary password
      await addUser(editing, 'Baspar@1234');
      toast.push('کاربر جدید با رمز پیش‌فرض Baspar@1234 ساخته شد', 'success');
    }
    setEditing(null);
  };

  const toggleActive = (u: User) => {
    updateUser(u.id, { active: !u.active });
    toast.push(u.active ? 'کاربر غیرفعال شد' : 'کاربر فعال شد');
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="surface rounded-2xl p-1.5 flex gap-1">
        <button onClick={() => setTab('list')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
            tab === 'list' ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'
          }`}>
          <I.Users size={14} /> لیست پرسنل
        </button>
        <button onClick={() => setTab('attendance')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition ${
            tab === 'attendance' ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'
          }`}>
          <I.Calendar size={14} /> ورود، خروج و مرخصی
        </button>
      </div>

      {tab === 'attendance' && <PersonnelAttendance />}

      {tab === 'list' && <>
      <div className="surface rounded-2xl p-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو بر اساس نام، ایمیل یا سمت..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-dark py-2 text-sm w-auto" value={filterRole} onChange={e => setFilterRole(e.target.value as Role | '')}>
          <option value="">همه نقش‌ها</option>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1"
          onClick={() => { downloadCSV(filtered.map(u => ({ نام: u.name, ایمیل: u.email, نقش: ROLE_LABEL[u.role], دپارتمان: u.department, سمت: u.jobTitle, تلفن: u.phone, امتیاز: u.performance, فعال: u.active ? 'بله' : 'خیر' })), 'personnel.csv'); toast.push('خروجی دانلود شد'); }}>
          <I.Download size={13} /> خروجی
        </button>
        <label className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer" title="واردسازی از Excel/CSV">
          <I.Upload size={13} /> واردسازی فایل
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => { if (e.target.files?.[0]) { setImportFile(e.target.files[0]); e.target.value = ''; } }} />
        </label>
        <button className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" onClick={openNew}>
          <I.Plus size={13} /> افزودن نفر جدید
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(u => (
          <div key={u.id} className={`surface rounded-2xl p-4 ${!u.active ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-lg text-ink-900">{u.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-sm">{u.name}</h4>
                  <span className="pill bg-amber-500/10 text-amber-200 border-amber-500/25">{ROLE_LABEL[u.role]}</span>
                  {!u.active && <span className="pill bg-rose-500/15 text-rose-200">غیرفعال</span>}
                </div>
                <div className="text-[11px] text-ink-400 mt-0.5">{u.jobTitle}</div>
                <div className="text-[11px] text-ink-400">{u.department}</div>
              </div>
              <Donut value={u.performance} size={56} label="امتیاز" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
              <div className="surface-soft rounded-lg p-2 flex items-center gap-1.5"><I.Mail size={11} className="text-amber-400" /><span className="truncate">{u.email}</span></div>
              <div className="surface-soft rounded-lg p-2 flex items-center gap-1.5"><I.Phone size={11} className="text-amber-400" /><span>{u.phone || '—'}</span></div>
            </div>

            {u.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {u.skills.slice(0, 4).map(s => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-200">{s}</span>)}
              </div>
            )}

            <div className="mt-3">
              <Sparkline data={[70, 72, 75, 73, 78, 82, u.performance]} />
            </div>

            <div className="mt-2 flex items-center gap-1 justify-end">
              <button className="text-[11px] px-2 py-1 rounded hover:bg-amber-500/10 text-amber-300" onClick={() => toggleActive(u)}>{u.active ? 'غیرفعال‌سازی' : 'فعال‌سازی'}</button>
              <button className="p-1.5 rounded hover:bg-amber-500/10 text-amber-300" onClick={() => setEditing(u)}><I.Edit size={13} /></button>
              <button className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300" onClick={() => setDel(u)}><I.Trash size={13} /></button>
            </div>

            <div className="mt-2 text-[10px] text-ink-400 flex justify-between">
              <span>عضویت: {formatJalali(u.joinedAt)}</span>
              {u.lastLoginAt && <span>آخرین ورود: {formatJalali(u.lastLoginAt)}</span>}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-bold text-base mb-3 flex items-center gap-2"><I.AI className="text-amber-400" /> <span className="text-gold-gradient">تحلیل عملکرد پرسنل</span></h3>
        <div className="grid md:grid-cols-3 gap-3">
          {insights.map(i => <AIInsightCard key={i.id} insight={i} />)}
        </div>
      </div>

      {editing && (
        <Modal open={true} onClose={() => setEditing(null)} title={users.some(u => u.id === editing.id) ? 'ویرایش کاربر' : 'افزودن کاربر'}
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => setEditing(null)}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={save}>ذخیره</button>
          </>}>
          <UserForm value={editing} onChange={setEditing} />
        </Modal>
      )}

      <ConfirmDialog open={!!del} onClose={() => setDel(null)} title="حذف کاربر" message={`آیا از حذف «${del?.name}» اطمینان دارید؟`}
        onConfirm={() => { if (del) { removeUser(del.id); toast.push('کاربر حذف شد', 'info'); } }} />

      <ImportWizard file={importFile} onClose={() => setImportFile(null)} />
      </>}
    </div>
  );
}

function UserForm({ value, onChange }: { value: User; onChange: (v: User) => void }) {
  const u = (p: Partial<User>) => onChange({ ...value, ...p });
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <L label="نام و نام خانوادگی *"><input className="input-dark" value={value.name} onChange={e => u({ name: e.target.value })} /></L>
      <L label="ایمیل *"><input type="email" className="input-dark" value={value.email} onChange={e => u({ email: e.target.value })} /></L>
      <L label="نقش">
        <select className="input-dark" value={value.role} onChange={e => u({ role: e.target.value as Role })}>
          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </L>
      <L label="دپارتمان"><input className="input-dark" value={value.department} onChange={e => u({ department: e.target.value })} /></L>
      <L label="سمت"><input className="input-dark" value={value.jobTitle} onChange={e => u({ jobTitle: e.target.value })} /></L>
      <L label="تلفن"><input className="input-dark" value={value.phone} onChange={e => u({ phone: e.target.value })} /></L>
      <L label="امتیاز عملکرد (۰-۱۰۰)"><input type="number" min={0} max={100} className="input-dark" value={value.performance} onChange={e => u({ performance: +e.target.value })} /></L>
      <L label="وضعیت">
        <select className="input-dark" value={value.active ? 'y' : 'n'} onChange={e => u({ active: e.target.value === 'y' })}>
          <option value="y">فعال</option><option value="n">غیرفعال</option>
        </select>
      </L>
      <L label="مهارت‌ها (با کاما جدا کنید)" full>
        <input className="input-dark" value={value.skills.join('، ')} onChange={e => u({ skills: e.target.value.split(/[،,]/).map(s => s.trim()).filter(Boolean) })} />
      </L>
    </div>
  );
}

function L({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`block ${full ? 'sm:col-span-2' : ''}`}><span className="text-[11px] text-ink-300 mb-1 block">{label}</span>{children}</label>;
}
