import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { faNum, formatJalali, uid, downloadCSV } from '../lib/utils';
import { Modal, ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import type { LeaveRequest, LeaveType, AttendanceRecord } from '../lib/types';

const LEAVE_TYPES: LeaveType[] = ['استحقاقی', 'استعلاجی', 'بدون حقوق', 'ساعتی', 'مأموریت', 'سایر'];

type Tab = 'today' | 'attendance' | 'leaves' | 'reports';

export function PersonnelAttendance() {
  const { users, attendance, leaves, clockIn, clockOut, addLeave, removeLeave, approveLeave, rejectLeave, removeAttendance, currentUser } = useApp();
  const [tab, setTab] = useState<Tab>('today');
  const [search, setSearch] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [delAtt, setDelAtt] = useState<AttendanceRecord | null>(null);
  const [delLeave, setDelLeave] = useState<LeaveRequest | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const toast = useToast();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  // Determine current status of each user (clocked in or out)
  const userStatus = useMemo(() => {
    const map = new Map<string, { lastIn?: AttendanceRecord; lastOut?: AttendanceRecord; isIn: boolean }>();
    users.forEach(u => {
      const records = attendance.filter(a => a.userId === u.id).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
      const lastIn = records.find(r => r.type === 'clock_in');
      const lastOut = records.find(r => r.type === 'clock_out');
      const isIn = !!lastIn && (!lastOut || new Date(lastIn.at) > new Date(lastOut.at));
      map.set(u.id, { lastIn, lastOut, isIn });
    });
    return map;
  }, [users, attendance]);

  // Filter attendance by date range
  const filteredAttendance = useMemo(() => {
    let list = [...attendance];
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter(r => new Date(r.at).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59);
      list = list.filter(r => new Date(r.at).getTime() <= to.getTime());
    }
    if (search) {
      list = list.filter(r => {
        const u = users.find(x => x.id === r.userId);
        return u?.name.includes(search) || false;
      });
    }
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [attendance, dateFrom, dateTo, search, users]);

  const filteredLeaves = useMemo(() => {
    let list = [...leaves];
    if (search) {
      list = list.filter(l => {
        const u = users.find(x => x.id === l.userId);
        return u?.name.includes(search) || l.type.includes(search) || l.reason.includes(search);
      });
    }
    return list.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }, [leaves, search, users]);

  // Calculate hours worked today
  const todayHours = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const map = new Map<string, number>();
    users.forEach(u => {
      const todayRecords = attendance
        .filter(r => r.userId === u.id && new Date(r.at) >= today)
        .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
      let totalMs = 0;
      let lastIn: number | null = null;
      todayRecords.forEach(r => {
        if (r.type === 'clock_in') lastIn = new Date(r.at).getTime();
        else if (r.type === 'clock_out' && lastIn) {
          totalMs += new Date(r.at).getTime() - lastIn;
          lastIn = null;
        }
      });
      // If still clocked in, count until now
      if (lastIn) totalMs += Date.now() - lastIn;
      map.set(u.id, totalMs / 3_600_000);
    });
    return map;
  }, [users, attendance]);

  const handleClockIn = (userId: string) => {
    clockIn(userId);
    const u = users.find(x => x.id === userId);
    toast.push(`✓ ورود ${u?.name} ثبت شد`, 'success');
  };

  const handleClockOut = (userId: string) => {
    clockOut(userId);
    const u = users.find(x => x.id === userId);
    toast.push(`✓ خروج ${u?.name} ثبت شد`, 'info');
  };

  const newLeave = (): LeaveRequest => ({
    id: uid('lv'),
    userId: currentUser?.id ?? users[0]?.id ?? '',
    type: 'استحقاقی',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: '',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  });

  const saveLeave = () => {
    if (!editingLeave) return;
    if (!editingLeave.reason.trim()) { toast.push('دلیل مرخصی الزامی است', 'error'); return; }
    addLeave(editingLeave);
    toast.push('درخواست مرخصی ثبت شد', 'success');
    setEditingLeave(null);
    setLeaveOpen(false);
  };

  // ====== Export reports ======
  const exportAttendanceCSV = () => {
    if (filteredAttendance.length === 0) { toast.push('داده‌ای برای خروجی موجود نیست', 'warning'); return; }
    downloadCSV(filteredAttendance.map(r => {
      const u = users.find(x => x.id === r.userId);
      return {
        نام: u?.name ?? '',
        سمت: u?.jobTitle ?? '',
        دپارتمان: u?.department ?? '',
        نوع: r.type === 'clock_in' ? 'ورود' : 'خروج',
        تاریخ_زمان: formatJalali(r.at, true),
        توضیحات: r.note ?? '',
        منبع: r.source ?? 'manual',
      };
    }), `attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.push('گزارش CSV دانلود شد', 'success');
  };

  const exportLeavesCSV = () => {
    if (filteredLeaves.length === 0) { toast.push('داده‌ای موجود نیست', 'warning'); return; }
    downloadCSV(filteredLeaves.map(l => {
      const u = users.find(x => x.id === l.userId);
      return {
        نام: u?.name ?? '',
        دپارتمان: u?.department ?? '',
        نوع_مرخصی: l.type,
        از_تاریخ: l.startDate,
        تا_تاریخ: l.endDate,
        دلیل: l.reason,
        وضعیت: l.status === 'pending' ? 'در انتظار' : l.status === 'approved' ? 'تأییدشده' : 'رد‌شده',
        تأییدکننده: l.reviewedBy ?? '',
      };
    }), `leaves_${new Date().toISOString().slice(0, 10)}.csv`);
    toast.push('گزارش مرخصی‌ها دانلود شد', 'success');
  };

  // Today's stats
  const presentCount = useMemo(() => {
    let count = 0;
    userStatus.forEach(s => { if (s.isIn) count++; });
    return count;
  }, [userStatus]);

  const totalLeavesToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return leaves.filter(l => l.status === 'approved' && l.startDate <= today && l.endDate >= today).length;
  }, [leaves]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface ring-gold rounded-2xl p-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300 to-amber-700 text-ink-900 shrink-0">
            <I.Calendar size={28} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-bold text-base text-gold-gradient">⏱ مدیریت ورود، خروج و مرخصی پرسنل</h3>
            <p className="text-xs text-ink-300 mt-1">ثبت ورود و خروج، مدیریت مرخصی‌ها، گزارش‌های ساعت کار و حضور</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="حاضر در کارخانه" value={faNum(presentCount)} color="emerald" />
        <StatBox label="در مرخصی" value={faNum(totalLeavesToday)} color="amber" />
        <StatBox label="کل پرسنل فعال" value={faNum(users.filter(u => u.active).length)} color="sky" />
        <StatBox label="درخواست‌های در انتظار" value={faNum(leaves.filter(l => l.status === 'pending').length)} color="rose" />
      </div>

      {/* Tabs */}
      <div className="surface rounded-2xl p-1.5 flex gap-1 flex-wrap">
        {[
          { k: 'today', l: 'ورود/خروج امروز', i: 'Activity' as const },
          { k: 'attendance', l: 'سوابق حضور', i: 'Calendar' as const },
          { k: 'leaves', l: 'مرخصی‌ها', i: 'Doc' as const },
          { k: 'reports', l: 'گزارش‌ها', i: 'Download' as const },
        ].map(t => {
          const Icon = I[t.i];
          return (
            <button key={t.k} onClick={() => setTab(t.k as Tab)}
              className={`px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition flex-1 sm:flex-none justify-center ${
                tab === t.k ? 'btn-gold' : 'text-amber-300 hover:bg-amber-500/10'
              }`}>
              <Icon size={12} />
              {t.l}
            </button>
          );
        })}
      </div>

      {/* TAB: TODAY - Clock in/out grid */}
      {tab === 'today' && (
        <div className="surface rounded-2xl p-5">
          <h4 className="font-bold text-gold-gradient mb-4 flex items-center gap-2">
            <I.Activity size={16} /> وضعیت لحظه‌ای پرسنل
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {users.filter(u => u.active).map(u => {
              const status = userStatus.get(u.id);
              const hours = todayHours.get(u.id) ?? 0;
              return (
                <div key={u.id} className={`surface-soft rounded-xl p-4 border ${status?.isIn ? 'border-emerald-400/40 bg-emerald-500/5' : 'border-amber-500/10'}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-700 flex items-center justify-center font-bold text-ink-900 shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{u.name}</div>
                      <div className="text-[10px] text-ink-400">{u.jobTitle}</div>
                      <div className="mt-1.5">
                        {status?.isIn ? (
                          <span className="pill bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            حاضر
                          </span>
                        ) : (
                          <span className="pill bg-ink-500/15 text-ink-300">خارج</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {status?.lastIn && (
                    <div className="mt-3 text-[10px] text-ink-400 space-y-0.5">
                      <div>آخرین ورود: <span className="text-emerald-300">{formatJalali(status.lastIn.at, true)}</span></div>
                      {status.lastOut && !status.isIn && (
                        <div>آخرین خروج: <span className="text-amber-300">{formatJalali(status.lastOut.at, true)}</span></div>
                      )}
                      <div>ساعت کار امروز: <span className="text-amber-300 font-bold">{faNum(hours.toFixed(1))} ساعت</span></div>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    {!status?.isIn ? (
                      <button onClick={() => handleClockIn(u.id)}
                        className="flex-1 btn-gold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1">
                        <I.Check size={12} /> ثبت ورود
                      </button>
                    ) : (
                      <button onClick={() => handleClockOut(u.id)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs border border-rose-400/40 text-rose-200 hover:bg-rose-500/15 flex items-center justify-center gap-1">
                        <I.Logout size={12} /> ثبت خروج
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE history */}
      {tab === 'attendance' && (
        <div className="surface rounded-2xl p-5">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
              <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو بر اساس نام..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <input type="date" className="input-dark py-2 text-sm w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} title="از تاریخ" />
            <input type="date" className="input-dark py-2 text-sm w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} title="تا تاریخ" />
            <button onClick={exportAttendanceCSV} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
              <I.Download size={13} /> خروجی CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-500/5 text-amber-300 text-xs">
                <tr>
                  <th className="px-3 py-3 text-right">#</th>
                  <th className="px-3 py-3 text-right">نام</th>
                  <th className="px-3 py-3 text-right">سمت</th>
                  <th className="px-3 py-3 text-right">نوع</th>
                  <th className="px-3 py-3 text-right">تاریخ و ساعت</th>
                  <th className="px-3 py-3 text-right">توضیحات</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {filteredAttendance.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-sm text-ink-400">سابقه‌ای یافت نشد</td></tr>
                )}
                {filteredAttendance.slice(0, 100).map((r, i) => {
                  const u = users.find(x => x.id === r.userId);
                  return (
                    <tr key={r.id} className="hover:bg-amber-500/5">
                      <td className="px-3 py-2 text-xs text-ink-400 font-mono">{faNum(i + 1)}</td>
                      <td className="px-3 py-2 font-bold">{u?.name ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-ink-300">{u?.jobTitle ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`pill ${r.type === 'clock_in' ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
                          {r.type === 'clock_in' ? '↓ ورود' : '↑ خروج'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">{formatJalali(r.at, true)}</td>
                      <td className="px-3 py-2 text-xs text-ink-300">{r.note ?? '—'}</td>
                      <td className="px-3 py-2 text-left">
                        {isAdmin && (
                          <button onClick={() => setDelAtt(r)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={12} /></button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredAttendance.length > 100 && (
            <p className="text-[11px] text-ink-400 text-center mt-3">
              نمایش ۱۰۰ مورد اول از {faNum(filteredAttendance.length)} — برای دیدن همه از خروجی CSV استفاده کنید
            </p>
          )}
        </div>
      )}

      {/* TAB: LEAVES */}
      {tab === 'leaves' && (
        <div className="surface rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
              <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={exportLeavesCSV} className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
              <I.Download size={13} /> خروجی CSV
            </button>
            <button onClick={() => { setEditingLeave(newLeave()); setLeaveOpen(true); }}
              className="btn-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1">
              <I.Plus size={13} /> ثبت مرخصی جدید
            </button>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="text-center py-10 text-sm text-ink-400">
              <I.Doc size={32} className="mx-auto text-amber-400 mb-2" />
              هیچ درخواست مرخصی ثبت نشده — روی «ثبت مرخصی جدید» کلیک کنید
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-500/5 text-amber-300 text-xs">
                  <tr>
                    <th className="px-3 py-3 text-right">نام</th>
                    <th className="px-3 py-3 text-right">نوع</th>
                    <th className="px-3 py-3 text-right">از تاریخ</th>
                    <th className="px-3 py-3 text-right">تا تاریخ</th>
                    <th className="px-3 py-3 text-right">دلیل</th>
                    <th className="px-3 py-3 text-right">وضعیت</th>
                    <th className="px-3 py-3 text-right">تأییدکننده</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-500/10">
                  {filteredLeaves.map(l => {
                    const u = users.find(x => x.id === l.userId);
                    return (
                      <tr key={l.id} className="hover:bg-amber-500/5">
                        <td className="px-3 py-2 font-bold">{u?.name ?? '—'}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className="pill bg-amber-500/15 text-amber-200">{l.type}</span>
                        </td>
                        <td className="px-3 py-2 text-xs">{formatJalali(l.startDate)}</td>
                        <td className="px-3 py-2 text-xs">{formatJalali(l.endDate)}</td>
                        <td className="px-3 py-2 text-xs max-w-xs truncate" title={l.reason}>{l.reason}</td>
                        <td className="px-3 py-2 text-xs">
                          <span className={`pill ${
                            l.status === 'pending' ? 'bg-sky-500/15 text-sky-200' :
                            l.status === 'approved' ? 'bg-emerald-500/15 text-emerald-200' :
                            'bg-rose-500/15 text-rose-200'
                          }`}>
                            {l.status === 'pending' ? '⏳ در انتظار' : l.status === 'approved' ? '✓ تأیید‌شده' : '✗ رد‌شده'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-ink-300">{l.reviewedBy ?? '—'}</td>
                        <td className="px-3 py-2 text-left">
                          <div className="flex gap-1 justify-end">
                            {isAdmin && l.status === 'pending' && (
                              <>
                                <button onClick={() => { approveLeave(l.id); toast.push('مرخصی تأیید شد', 'success'); }} title="تأیید"
                                  className="px-2 py-1 rounded text-[11px] bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"><I.Check size={11} /></button>
                                <button onClick={() => { rejectLeave(l.id); toast.push('مرخصی رد شد', 'info'); }} title="رد"
                                  className="px-2 py-1 rounded text-[11px] bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"><I.X size={11} /></button>
                              </>
                            )}
                            <button onClick={() => setDelLeave(l)} className="p-1.5 rounded hover:bg-rose-500/10 text-rose-300"><I.Trash size={11} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: REPORTS */}
      {tab === 'reports' && (
        <div className="surface rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-gold-gradient">📊 گزارش ساعت کار پرسنل</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-500/5 text-amber-300 text-xs">
                <tr>
                  <th className="px-3 py-3 text-right">نام</th>
                  <th className="px-3 py-3 text-right">سمت</th>
                  <th className="px-3 py-3 text-right">دپارتمان</th>
                  <th className="px-3 py-3 text-right">ساعت کار امروز</th>
                  <th className="px-3 py-3 text-right">کل ساعت ثبت‌شده</th>
                  <th className="px-3 py-3 text-right">مرخصی‌های امسال</th>
                  <th className="px-3 py-3 text-right">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {users.filter(u => u.active).map(u => {
                  const status = userStatus.get(u.id);
                  const today = todayHours.get(u.id) ?? 0;
                  // calculate total hours
                  const userAtt = attendance.filter(a => a.userId === u.id).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
                  let totalMs = 0;
                  let lastIn: number | null = null;
                  userAtt.forEach(r => {
                    if (r.type === 'clock_in') lastIn = new Date(r.at).getTime();
                    else if (r.type === 'clock_out' && lastIn) { totalMs += new Date(r.at).getTime() - lastIn; lastIn = null; }
                  });
                  const totalHours = totalMs / 3_600_000;
                  const userLeaves = leaves.filter(l => l.userId === u.id && l.status === 'approved').length;
                  return (
                    <tr key={u.id} className="hover:bg-amber-500/5">
                      <td className="px-3 py-2.5 font-bold">{u.name}</td>
                      <td className="px-3 py-2.5 text-xs">{u.jobTitle}</td>
                      <td className="px-3 py-2.5 text-xs">{u.department}</td>
                      <td className="px-3 py-2.5 font-display text-amber-300">{faNum(today.toFixed(1))}h</td>
                      <td className="px-3 py-2.5 font-display text-emerald-300">{faNum(totalHours.toFixed(0))}h</td>
                      <td className="px-3 py-2.5 text-xs">{faNum(userLeaves)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`pill ${status?.isIn ? 'bg-emerald-500/15 text-emerald-200' : 'bg-ink-500/15 text-ink-300'}`}>
                          {status?.isIn ? 'حاضر' : 'خارج'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button onClick={() => {
            downloadCSV(users.filter(u => u.active).map(u => {
              const today = todayHours.get(u.id) ?? 0;
              const userAtt = attendance.filter(a => a.userId === u.id).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
              let totalMs = 0; let lastIn: number | null = null;
              userAtt.forEach(r => {
                if (r.type === 'clock_in') lastIn = new Date(r.at).getTime();
                else if (r.type === 'clock_out' && lastIn) { totalMs += new Date(r.at).getTime() - lastIn; lastIn = null; }
              });
              return {
                نام: u.name,
                سمت: u.jobTitle,
                دپارتمان: u.department,
                'ساعت کار امروز': today.toFixed(1),
                'کل ساعت ثبت‌شده': (totalMs / 3_600_000).toFixed(0),
                'مرخصی‌های تأییدشده': leaves.filter(l => l.userId === u.id && l.status === 'approved').length,
              };
            }), `personnel_report_${new Date().toISOString().slice(0, 10)}.csv`);
            toast.push('گزارش جامع پرسنل دانلود شد', 'success');
          }} className="btn-gold px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto">
            <I.Download size={14} /> دانلود گزارش جامع CSV
          </button>
        </div>
      )}

      {/* Leave Modal */}
      {leaveOpen && editingLeave && (
        <Modal open={true} onClose={() => { setLeaveOpen(false); setEditingLeave(null); }}
          title="ثبت درخواست مرخصی"
          footer={<>
            <button className="btn-ghost-gold px-4 py-2 rounded-lg text-sm" onClick={() => { setLeaveOpen(false); setEditingLeave(null); }}>انصراف</button>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm" onClick={saveLeave}>ثبت درخواست</button>
          </>}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-amber-300 mb-1 block">پرسنل *</label>
              <select className="input-dark" value={editingLeave.userId} onChange={e => setEditingLeave({ ...editingLeave, userId: e.target.value })}>
                {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name} — {u.jobTitle}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-amber-300 mb-1 block">نوع مرخصی *</label>
              <select className="input-dark" value={editingLeave.type} onChange={e => setEditingLeave({ ...editingLeave, type: e.target.value as LeaveType })}>
                {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-amber-300 mb-1 block">از تاریخ *</label>
                <input type="date" className="input-dark" value={editingLeave.startDate} onChange={e => setEditingLeave({ ...editingLeave, startDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-amber-300 mb-1 block">تا تاریخ *</label>
                <input type="date" className="input-dark" value={editingLeave.endDate} onChange={e => setEditingLeave({ ...editingLeave, endDate: e.target.value })} />
              </div>
            </div>
            {editingLeave.type === 'ساعتی' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-amber-300 mb-1 block">ساعت شروع</label>
                  <input type="time" className="input-dark" value={editingLeave.startTime ?? ''} onChange={e => setEditingLeave({ ...editingLeave, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-amber-300 mb-1 block">ساعت پایان</label>
                  <input type="time" className="input-dark" value={editingLeave.endTime ?? ''} onChange={e => setEditingLeave({ ...editingLeave, endTime: e.target.value })} />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs text-amber-300 mb-1 block">دلیل *</label>
              <textarea className="input-dark min-h-[80px]" value={editingLeave.reason} onChange={e => setEditingLeave({ ...editingLeave, reason: e.target.value })} placeholder="دلیل و توضیحات درخواست مرخصی..." />
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog open={!!delAtt} onClose={() => setDelAtt(null)} title="حذف رکورد حضور"
        message="آیا از حذف این رکورد اطمینان دارید؟"
        onConfirm={() => { if (delAtt) { removeAttendance(delAtt.id); toast.push('رکورد حذف شد', 'info'); } }} />
      <ConfirmDialog open={!!delLeave} onClose={() => setDelLeave(null)} title="حذف مرخصی"
        message="آیا از حذف این درخواست مرخصی اطمینان دارید؟"
        onConfirm={() => { if (delLeave) { removeLeave(delLeave.id); toast.push('مرخصی حذف شد', 'info'); } }} />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'emerald' | 'amber' | 'sky' | 'rose' }) {
  const cls = { emerald: 'text-emerald-300', amber: 'text-amber-300', sky: 'text-sky-300', rose: 'text-rose-300' }[color];
  return (
    <div className="surface rounded-xl p-4">
      <div className="text-[11px] text-ink-300">{label}</div>
      <div className={`font-display text-2xl mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
