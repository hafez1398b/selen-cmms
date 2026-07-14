import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AppCtx, loadState, saveState, clearStorage, type AppContextType } from './lib/store';
import { seedUsers, seedEquipment, seedWOs, seedPMs, seedParts, seedSuppliers, seedNotifications, seedAudit, seedExcel, seedCompany, SEED_PASSWORD, SEED_PASSWORD_MARKER } from './lib/seed';
import type { User, Equipment, WorkOrder, PMPlan, SparePart, Supplier, Notification, AuditLog, ExcelFile, ThemeMode, PendingRequest, CompanyProfile, MappingTemplate, AttendanceRecord, LeaveRequest } from './lib/types';
import { uid } from './lib/utils';
import { hashPassword, verifyPassword } from './lib/auth';
import { dispatchNotification, getNotifyPrefs } from './lib/notify';

export function AppProvider({ children }: { children: ReactNode }) {
  const persisted = loadState();

  const [theme, setThemeState] = useState<ThemeMode>(persisted?.theme ?? 'dark');
  const [currentUser, setCurrentUser] = useState<User | null>(persisted?.currentUser ?? null);
  const [users, setUsers] = useState<User[]>(persisted?.users ?? seedUsers);
  const [equipment, setEquipment] = useState<Equipment[]>(persisted?.equipment ?? seedEquipment);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(persisted?.workOrders ?? seedWOs);
  const [pms, setPMs] = useState<PMPlan[]>(persisted?.pms ?? seedPMs);
  const [parts, setParts] = useState<SparePart[]>(persisted?.parts ?? seedParts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(persisted?.suppliers ?? seedSuppliers);
  const [notifications, setNotifications] = useState<Notification[]>(persisted?.notifications ?? seedNotifications);
  const [audit, setAudit] = useState<AuditLog[]>(persisted?.audit ?? seedAudit);
  const [excelFiles, setExcelFiles] = useState<ExcelFile[]>(persisted?.excelFiles ?? seedExcel);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(persisted?.pendingRequests ?? []);
  const [company, setCompany] = useState<CompanyProfile>(persisted?.company ?? seedCompany);
  const [mappingTemplates, setMappingTemplates] = useState<MappingTemplate[]>(persisted?.mappingTemplates ?? []);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(persisted?.attendance ?? []);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(persisted?.leaves ?? []);
  const [bootReady, setBootReady] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Boot: compute real password hashes for seed users
  useEffect(() => {
    (async () => {
      const needsHash = users.some(u => u.passwordHash === SEED_PASSWORD_MARKER || !u.passwordHash);
      if (needsHash) {
        const realHash = await hashPassword(SEED_PASSWORD);
        setUsers(prev => prev.map(u => (u.passwordHash === SEED_PASSWORD_MARKER || !u.passwordHash) ? { ...u, passwordHash: realHash, mustChangePassword: u.role !== 'admin' } : u));
      }

      // Generate mock maintenance history if not yet generated
      const MOCK_HISTORY_KEY = 'baspar_mock_history_v3';
      const hasHistory = localStorage.getItem(MOCK_HISTORY_KEY);
      if (!hasHistory && equipment.length > 5 && workOrders.length <= 6) {
        try {
          const { generateMockHistory, condenseHistory } = await import('./lib/mockHistory');
          const history = condenseHistory(generateMockHistory(equipment, users, { skipExisting: workOrders }), 15);
          setWorkOrders(prev => [...history, ...prev]);
          localStorage.setItem(MOCK_HISTORY_KEY, '1');
          console.log(`✓ ${history.length} mock work orders generated`);
        } catch (e) { console.warn('Mock history failed:', e); }
      }

      // Generate mock attendance records (last 30 days)
      const MOCK_ATTENDANCE_KEY = 'baspar_mock_attendance_v1';
      if (!localStorage.getItem(MOCK_ATTENDANCE_KEY) && attendance.length === 0 && users.length > 0) {
        try {
          const mockRecs: AttendanceRecord[] = [];
          const activeUsers = users.filter(u => u.active);
          const today = new Date(); today.setHours(0, 0, 0, 0);
          for (let dayAgo = 30; dayAgo >= 1; dayAgo--) {
            const dayDate = new Date(today.getTime() - dayAgo * 86400000);
            const dow = dayDate.getDay();
            if (dow === 5) continue; // Friday off
            activeUsers.forEach((u, idx) => {
              if (Math.random() < 0.12) return; // 12% absence rate
              // Clock in around 7:30-8:30
              const inHr = 7 + Math.floor(Math.random() * 2);
              const inMin = Math.floor(Math.random() * 60);
              const inAt = new Date(dayDate); inAt.setHours(inHr, inMin, 0, 0);
              mockRecs.push({
                id: uid('att'), userId: u.id, type: 'clock_in',
                at: inAt.toISOString(), source: 'auto',
              });
              // Clock out around 16:00-18:00
              const outHr = 16 + Math.floor(Math.random() * 2);
              const outMin = Math.floor(Math.random() * 60);
              const outAt = new Date(dayDate); outAt.setHours(outHr, outMin, 0, 0);
              mockRecs.push({
                id: uid('att'), userId: u.id, type: 'clock_out',
                at: outAt.toISOString(), source: 'auto',
              });
              void idx;
            });
          }
          setAttendance(mockRecs);
          // Generate 5-8 sample leave requests
          const mockLeaves: LeaveRequest[] = [];
          const leaveTypes: LeaveRequest['type'][] = ['استحقاقی', 'استعلاجی', 'مأموریت'];
          for (let i = 0; i < 8; i++) {
            const u = activeUsers[Math.floor(Math.random() * activeUsers.length)];
            const dayOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
            const startDate = new Date(Date.now() + dayOffset * 86400000);
            const duration = 1 + Math.floor(Math.random() * 4);
            const endDate = new Date(startDate.getTime() + duration * 86400000);
            const status: LeaveRequest['status'] = dayOffset < -3 ? 'approved' : Math.random() < 0.5 ? 'pending' : 'approved';
            mockLeaves.push({
              id: uid('lv'), userId: u.id,
              type: leaveTypes[i % leaveTypes.length],
              startDate: startDate.toISOString().slice(0, 10),
              endDate: endDate.toISOString().slice(0, 10),
              reason: ['مرخصی شخصی', 'مراجعه به پزشک', 'مأموریت بازرسی', 'تعطیلات خانوادگی', 'استراحت'][i % 5],
              status,
              requestedAt: new Date(startDate.getTime() - 3 * 86400000).toISOString(),
              reviewedBy: status !== 'pending' ? 'مهندس کریمی' : undefined,
              reviewedAt: status !== 'pending' ? new Date(startDate.getTime() - 86400000).toISOString() : undefined,
            });
          }
          setLeaves(mockLeaves);
          localStorage.setItem(MOCK_ATTENDANCE_KEY, '1');
          console.log(`✓ ${mockRecs.length} attendance + ${mockLeaves.length} leaves generated`);
        } catch (e) { console.warn('Mock attendance failed:', e); }
      }

      setBootReady(true);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist
  useEffect(() => {
    if (!bootReady) return;
    saveState({ theme, currentUser, users, equipment, workOrders, pms, parts, suppliers, notifications, audit, excelFiles, pendingRequests, company, mappingTemplates, attendance, leaves });
  }, [bootReady, theme, currentUser, users, equipment, workOrders, pms, parts, suppliers, notifications, audit, excelFiles, pendingRequests, company, mappingTemplates, attendance, leaves]);

  const setTheme = (t: ThemeMode) => setThemeState(t);

  const logAction = useCallback((action: string, module: string, target?: string) => {
    setAudit(a => [{ id: uid('a'), user: currentUser?.name ?? 'مهمان', action, module, target, at: new Date().toISOString() }, ...a].slice(0, 1000));
  }, [currentUser]);

  const loginWithPassword = async (email: string, password: string): Promise<{ ok: boolean; message?: string; mustChange?: boolean }> => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) return { ok: false, message: 'کاربری با این ایمیل یافت نشد' };
    if (!found.active) return { ok: false, message: 'حساب کاربری شما غیرفعال است. با ادمین تماس بگیرید.' };
    const ok = await verifyPassword(password, found.passwordHash);
    if (!ok) {
      setAudit(a => [{ id: uid('a'), user: email, action: 'تلاش ناموفق برای ورود', module: 'احراز هویت', at: new Date().toISOString() }, ...a]);
      return { ok: false, message: 'رمز عبور نادرست است' };
    }
    const u = { ...found, lastLoginAt: new Date().toISOString() };
    setUsers(prev => prev.map(p => p.id === u.id ? u : p));
    setCurrentUser(u);
    setAudit(a => [{ id: uid('a'), user: u.name, action: 'ورود موفق به سیستم', module: 'احراز هویت', at: new Date().toISOString() }, ...a]);
    // Auto-request notification permission once after first login (silent if denied)
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => { /* ignore */ });
      }
    }, 1500);
    return { ok: true, mustChange: !!u.mustChangePassword };
  };

  const logout = () => {
    if (currentUser) {
      setAudit(a => [{ id: uid('a'), user: currentUser.name, action: 'خروج از سیستم', module: 'احراز هویت', at: new Date().toISOString() }, ...a]);
    }
    setCurrentUser(null);
  };

  const changePassword = async (userId: string, newPassword: string) => {
    const hash = await hashPassword(newPassword);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: hash, mustChangePassword: false } : u));
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, passwordHash: hash, mustChangePassword: false });
    }
    logAction('تغییر رمز عبور', 'احراز هویت', userId);
  };

  const value: AppContextType = {
    currentUser, theme, users, equipment, workOrders, pms, parts, suppliers, notifications, audit, excelFiles, pendingRequests, company, mappingTemplates,
    setTheme, loginWithPassword, logout, changePassword,
    addUser: async (u, plainPassword) => {
      const hash = await hashPassword(plainPassword);
      const withHash = { ...u, passwordHash: hash };
      setUsers(p => [withHash, ...p]);
      logAction('افزودن کاربر', 'پرسنل', u.name);
    },
    updateUser: (id, patch) => {
      setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
      // Sync currentUser if it's the same user
      if (currentUser?.id === id) {
        setCurrentUser({ ...currentUser, ...patch });
      }
      logAction('ویرایش کاربر', 'پرسنل', id);
    },
    removeUser: id => {
      const u = users.find(x => x.id === id);
      if (u?.role === 'admin' && users.filter(x => x.role === 'admin' && x.active).length <= 1) {
        throw new Error('نمی‌توان آخرین ادمین فعال را حذف کرد');
      }
      setUsers(p => p.filter(u => u.id !== id));
      logAction('حذف کاربر', 'پرسنل', id);
    },
    resetUserPassword: async (userId, newPassword) => {
      const hash = await hashPassword(newPassword);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, passwordHash: hash, mustChangePassword: true } : u));
      logAction('بازنشانی رمز توسط ادمین', 'پرسنل', userId);
    },
    addPendingRequest: r => {
      setPendingRequests(prev => [{ ...r, id: uid('pr'), at: new Date().toISOString(), status: 'pending' }, ...prev]);
      setNotifications(n => [{
        id: uid('n'), type: 'approval', title: 'درخواست جدید عضویت',
        body: `${r.name} (${r.email}) درخواست دسترسی داده است.`,
        at: new Date().toISOString(), read: false, channel: ['inapp', 'email'],
      }, ...n]);
    },
    approveRequest: async (id, asRole, password) => {
      const req = pendingRequests.find(r => r.id === id);
      if (!req) return;
      const hash = await hashPassword(password);
      const newUser: User = {
        id: uid('u'), name: req.name, email: req.email, role: asRole,
        department: req.department ?? 'تولید', jobTitle: req.jobTitle ?? 'کاربر',
        phone: req.phone ?? '', skills: [], certifications: [], performance: 80,
        active: true, joinedAt: new Date().toISOString().slice(0, 10),
        passwordHash: hash, mustChangePassword: true,
        loginProvider: req.type === 'google_login' ? 'google' : 'password',
      };
      setUsers(prev => [newUser, ...prev]);
      setPendingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', reviewedBy: currentUser?.name, reviewedAt: new Date().toISOString() } : r));
      logAction('تأیید درخواست عضویت', 'پرسنل', req.email);
    },
    rejectRequest: id => {
      const req = pendingRequests.find(r => r.id === id);
      setPendingRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', reviewedBy: currentUser?.name, reviewedAt: new Date().toISOString() } : r));
      logAction('رد درخواست عضویت', 'پرسنل', req?.email);
    },
    updateCompany: patch => {
      setCompany(c => ({ ...c, ...patch }));
      logAction('به‌روزرسانی اطلاعات شرکت', 'تنظیمات');
    },
    addEquipment: e => { setEquipment(p => [...p, e]); logAction('افزودن تجهیز', 'تجهیزات', e.code); },
    updateEquipment: (id, patch) => { setEquipment(p => p.map(e => e.id === id ? { ...e, ...patch } : e)); logAction('ویرایش تجهیز', 'تجهیزات', id); },
    removeEquipment: id => { setEquipment(p => p.filter(e => e.id !== id && e.parentId !== id)); logAction('حذف تجهیز', 'تجهیزات', id); },
    addWO: w => {
      setWorkOrders(p => [w, ...p]);
      logAction('ایجاد دستور کار', 'دستور کار', w.number);
      // Push a real notification with sound/browser push for each assignee
      const prefs = getNotifyPrefs();
      w.assignedTo.forEach(uid_ => {
        const target = users.find(u => u.id === uid_);
        const body = `${w.number}: ${w.title}\nاولویت: ${w.priority}\nدپارتمان: ${w.department}`;
        // Add to in-app notification list
        setNotifications(n => [{
          id: uid('n'), type: 'wo_assigned',
          title: `دستور کار جدید — ${target?.name ?? ''}`.trim(),
          body, at: new Date().toISOString(), read: false,
          channel: prefs.defaultChannels.length ? prefs.defaultChannels : ['inapp', 'push'],
          link: w.id,
        }, ...n]);
        // Real-time delivery
        dispatchNotification({
          channels: ['inapp', 'push'],
          target: { email: target?.email, phone: target?.phone },
          title: `دستور کار جدید برای ${target?.name ?? 'تکنسین'}`,
          body,
          kind: w.priority === 'critical' ? 'critical' : w.priority === 'high' ? 'warning' : 'normal',
          silent: !prefs.sound,
        });
      });
    },
    updateWO: (id, patch) => { setWorkOrders(p => p.map(w => w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w)); logAction('ویرایش دستور کار', 'دستور کار', id); },
    removeWO: id => { setWorkOrders(p => p.filter(w => w.id !== id)); logAction('حذف دستور کار', 'دستور کار', id); },
    markWOViewed: (woId, userId) => {
      setWorkOrders(p => p.map(w => {
        if (w.id !== woId) return w;
        const viewedAt = w.viewedAt ?? [];
        if (viewedAt.some(v => v.userId === userId)) return w;
        return { ...w, viewedAt: [...viewedAt, { userId, at: new Date().toISOString() }] };
      }));
    },
    addPM: pm => { setPMs(p => [pm, ...p]); logAction('افزودن PM', 'نگهداری پیشگیرانه', pm.name); },
    updatePM: (id, patch) => { setPMs(p => p.map(pm => pm.id === id ? { ...pm, ...patch } : pm)); },
    removePM: id => { setPMs(p => p.filter(pm => pm.id !== id)); logAction('حذف PM', 'نگهداری پیشگیرانه', id); },
    addPart: part => { setParts(p => [part, ...p]); logAction('افزودن قطعه', 'انبار', part.code); },
    updatePart: (id, patch) => { setParts(p => p.map(pt => pt.id === id ? { ...pt, ...patch } : pt)); },
    removePart: id => { setParts(p => p.filter(pt => pt.id !== id)); logAction('حذف قطعه', 'انبار', id); },
    addSupplier: s => { setSuppliers(p => [s, ...p]); logAction('افزودن تأمین‌کننده', 'تأمین‌کنندگان', s.name); },
    updateSupplier: (id, patch) => { setSuppliers(p => p.map(s => s.id === id ? { ...s, ...patch } : s)); logAction('ویرایش تأمین‌کننده', 'تأمین‌کنندگان', id); },
    removeSupplier: id => { setSuppliers(p => p.filter(s => s.id !== id)); logAction('حذف تأمین‌کننده', 'تأمین‌کنندگان', id); },
    markNotificationRead: id => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x)),
    markAllNotificationsRead: () => setNotifications(n => n.map(x => ({ ...x, read: true }))),
    pushNotification: notif => {
      setNotifications(n => [notif, ...n]);
      // Real delivery: play sound, browser push, and channel-specific dispatch
      const prefs = getNotifyPrefs();
      const target = notif.link
        ? users.find(u => u.id === notif.link)
        : currentUser;
      dispatchNotification({
        channels: notif.channel,
        target: { email: target?.email, phone: target?.phone },
        title: notif.title,
        body: notif.body,
        kind: notif.type === 'wo_overdue' || notif.type === 'inventory_low' ? 'critical'
          : notif.type === 'pm_due' || notif.type === 'wo_due' ? 'warning'
            : 'normal',
        silent: !prefs.sound,
      });
    },
    addExcel: f => { setExcelFiles(p => [f, ...p]); logAction('بارگذاری فایل اکسل', 'انبار اکسل', f.name); },
    removeExcel: id => { setExcelFiles(p => p.filter(f => f.id !== id)); },
    saveMappingTemplate: t => {
      setMappingTemplates(prev => {
        const existing = prev.find(x => x.fingerprint === t.fingerprint && x.target === t.target);
        if (existing) {
          return prev.map(x => x.id === existing.id
            ? { ...existing, mapping: t.mapping, lastUsedAt: new Date().toISOString(), usageCount: existing.usageCount + 1 }
            : x);
        }
        return [{ ...t, usageCount: 1, createdAt: new Date().toISOString(), lastUsedAt: new Date().toISOString() }, ...prev].slice(0, 50);
      });
    },
    deleteMappingTemplate: id => setMappingTemplates(prev => prev.filter(t => t.id !== id)),
    // attendance
    attendance, leaves,
    clockIn: (userId, note) => {
      setAttendance(prev => [{ id: uid('att'), userId, type: 'clock_in', at: new Date().toISOString(), note, source: 'manual' }, ...prev]);
      const u = users.find(x => x.id === userId);
      logAction('ثبت ورود', 'پرسنل', u?.name ?? userId);
    },
    clockOut: (userId, note) => {
      setAttendance(prev => [{ id: uid('att'), userId, type: 'clock_out', at: new Date().toISOString(), note, source: 'manual' }, ...prev]);
      const u = users.find(x => x.id === userId);
      logAction('ثبت خروج', 'پرسنل', u?.name ?? userId);
    },
    addAttendance: r => setAttendance(prev => [r, ...prev]),
    updateAttendance: (id, patch) => setAttendance(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)),
    removeAttendance: id => setAttendance(prev => prev.filter(r => r.id !== id)),
    addLeave: l => {
      setLeaves(prev => [l, ...prev]);
      const u = users.find(x => x.id === l.userId);
      logAction('ثبت درخواست مرخصی', 'پرسنل', u?.name ?? l.userId);
    },
    updateLeave: (id, patch) => setLeaves(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l)),
    removeLeave: id => setLeaves(prev => prev.filter(l => l.id !== id)),
    approveLeave: (id, note) => {
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' as const, reviewedBy: currentUser?.name, reviewedAt: new Date().toISOString(), reviewNote: note } : l));
      logAction('تأیید مرخصی', 'پرسنل', id);
    },
    rejectLeave: (id, note) => {
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' as const, reviewedBy: currentUser?.name, reviewedAt: new Date().toISOString(), reviewNote: note } : l));
      logAction('رد مرخصی', 'پرسنل', id);
    },
    logAction,
    exportFullBackup: () => JSON.stringify({
      theme, currentUser: null, users, equipment, workOrders, pms, parts, suppliers,
      notifications, audit, excelFiles, pendingRequests, company,
      exportedAt: new Date().toISOString(),
    }, null, 2),
    importFullBackup: (json) => {
      try {
        const d = JSON.parse(json);
        if (d.users) setUsers(d.users);
        if (d.equipment) setEquipment(d.equipment);
        if (d.workOrders) setWorkOrders(d.workOrders);
        if (d.pms) setPMs(d.pms);
        if (d.parts) setParts(d.parts);
        if (d.notifications) setNotifications(d.notifications);
        if (d.audit) setAudit(d.audit);
        if (d.excelFiles) setExcelFiles(d.excelFiles);
        if (d.pendingRequests) setPendingRequests(d.pendingRequests);
        if (d.company) setCompany(d.company);
        logAction('بازیابی نسخه پشتیبان', 'سیستم');
        return true;
      } catch { return false; }
    },
    resetAllData: () => {
      clearStorage();
      window.location.reload();
    },
  };

  if (!bootReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-amber-300 text-sm">در حال آماده‌سازی سامانه...</div>
      </div>
    );
  }

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
