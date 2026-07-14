import type { Equipment, User, WorkOrder, PMPlan, SparePart, Supplier, Notification, ExcelFile, AuditLog, CompanyProfile } from './types';
import { uid } from './utils';

// Default company profile - editable by admin
export const seedCompany: CompanyProfile = {
  name: 'گروه صنعتی سلن (بسپارفوم غرب)',
  nameEn: 'SELEN Industrial Group',
  industry: 'تولید انواع فوم و اسفنج پلی‌اورتان صنعتی',
  address: 'استان کرمانشاه، شهرک صنعتی، خیابان صنعت',
  phone: '۰۸۳-۳۴۲۸۰۰۰۰',
  email: 'info@selengroup.ir',
  website: 'www.selengroup.ir',
  ceo: 'مهندس علی رضایی',
  established: '۱۳۹۲',
  employeeCount: 250,
  factories: ['کارخانه مموری فوم', 'کارخانه فوم پلی‌یورتان', 'کارخانه اسفنج', 'کارخانه برش اسفنج'],
  description: 'گروه صنعتی سلن، تولیدکننده تخصصی انواع فوم پلی‌اورتان نرم، فوم مموری، اسفنج و محصولات برش برای صنایع مبلمان، خودروسازی، عایق‌سازی و بسته‌بندی. شامل ۴ کارخانه فعال.',
};

// PLACEHOLDER hashes — will be recomputed on first boot using real password "Baspar@1234" for all seed users
const PH = '__SEED__';

// Realistic Persian seed data for Baspar Foam Gharb (polyurethane foam factory)
export const seedUsers: User[] = [
  {
    id: 'u_admin', name: 'مهندس علی رضایی', email: 'admin@basparfoam.ir', role: 'admin',
    department: 'مدیریت', jobTitle: 'مدیر سیستم', phone: '۰۹۱۲۳۴۵۶۷۸۹',
    skills: ['مدیریت سیستم', 'ISO 55001', 'CMMS'], certifications: [{ name: 'ISO 55001', expiry: '2027-03-20' }],
    performance: 96, active: true, joinedAt: '2021-04-01',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_mng', name: 'مهندس حسین کریمی', email: 'manager@basparfoam.ir', role: 'manager',
    department: 'تعمیرات', jobTitle: 'مدیر نگهداری و تعمیرات', phone: '۰۹۱۲۱۱۱۲۲۳۳',
    skills: ['برنامه‌ریزی PM', 'مدیریت دارایی', 'RCM'], certifications: [{ name: 'CMRP', expiry: '2026-09-12' }],
    performance: 92, active: true, joinedAt: '2020-06-15',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_sup1', name: 'مهندس مجید احمدی', email: 'sup1@basparfoam.ir', role: 'supervisor',
    department: 'تولید', jobTitle: 'سرپرست خط ۱', phone: '۰۹۱۲۲۲۲۳۳۴۴',
    skills: ['تولید فوم', 'مدیریت شیفت'], certifications: [{ name: 'HSE', expiry: '2026-01-10' }],
    performance: 88, active: true, joinedAt: '2019-09-01',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_tech1', name: 'سعید موسوی', email: 'tech1@basparfoam.ir', role: 'technician',
    department: 'مکانیک', jobTitle: 'تکنسین مکانیک ارشد', phone: '۰۹۱۸۷۷۷۸۸۹۹',
    skills: ['تعمیر پمپ', 'هیدرولیک', 'گیربکس'], certifications: [{ name: 'هیدرولیک سطح ۲', expiry: '2026-05-22' }],
    performance: 91, active: true, joinedAt: '2018-02-20',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_tech2', name: 'رضا فتاحی', email: 'tech2@basparfoam.ir', role: 'technician',
    department: 'برق', jobTitle: 'تکنسین برق صنعتی', phone: '۰۹۱۸۶۶۶۵۵۴۴',
    skills: ['PLC', 'درایو', 'موتور القایی'], certifications: [{ name: 'برق صنعتی', expiry: '2025-12-01' }],
    performance: 85, active: true, joinedAt: '2019-07-11',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_tech3', name: 'محمد جعفری', email: 'tech3@basparfoam.ir', role: 'technician',
    department: 'تأسیسات', jobTitle: 'تکنسین تأسیسات', phone: '۰۹۱۸۵۵۵۴۴۳۳',
    skills: ['کمپرسور', 'دیگ بخار', 'چیلر'], certifications: [{ name: 'دیگ بخار', expiry: '2026-08-15' }],
    performance: 82, active: true, joinedAt: '2020-01-05',
    passwordHash: PH, loginProvider: 'password',
  },
  {
    id: 'u_op1', name: 'حمید رستمی', email: 'op1@basparfoam.ir', role: 'operator',
    department: 'تولید', jobTitle: 'اپراتور خط ۲', phone: '۰۹۱۸۴۴۴۳۳۲۲',
    skills: ['اپراتوری'], certifications: [], performance: 78, active: true, joinedAt: '2021-03-12',
    passwordHash: PH, loginProvider: 'password',
  },
];

// Default seed password — for all seed users at first boot
export const SEED_PASSWORD = 'Baspar@1234';
export const SEED_PASSWORD_MARKER = PH;

let eqCounter = 0;
const eq = (parentId: string | null, code: string, name: string, dept: string, extras?: Partial<Equipment>): Equipment => {
  eqCounter++;
  return {
    id: `eq_${code}_${eqCounter}`,
    parentId, code, name,
    category: extras?.category ?? 'تجهیز',
    department: dept,
    location: extras?.location ?? 'سالن اصلی',
    manufacturer: extras?.manufacturer ?? 'متفرقه',
    model: extras?.model ?? '-',
    serial: extras?.serial ?? `SN-${1000 + eqCounter}`,
    year: extras?.year ?? 2018,
    purchaseDate: extras?.purchaseDate ?? '2018-05-20',
    purchaseCost: extras?.purchaseCost ?? 0,
    status: extras?.status ?? 'active',
    criticality: extras?.criticality ?? 'medium',
    healthScore: extras?.healthScore ?? 80,
    rulDays: extras?.rulDays ?? 540,
    notes: extras?.notes,
  };
};

export const seedEquipment: Equipment[] = (() => {
  // Helper to create equipment with extended custom fields (asset profile)
  const eqFull = (
    parentId: string | null, code: string, name: string, dept: string,
    extras: Partial<Equipment> & { customFields?: Record<string, string> }
  ): Equipment => {
    const base = eq(parentId, code, name, dept, extras);
    return { ...base, customFields: extras.customFields };
  };

  // ====== کارخانه اصلی: گروه صنعتی سلن (بسپارفوم غرب) ======
  const group = eq(null, 'GRP-01', 'گروه صنعتی سلن', 'مدیریت', { category: 'کارخانه', criticality: 'critical', healthScore: 92, rulDays: 3650 });

  // ============= کارخانه ۱: مموری فوم (Memory Foam) =============
  const memFactory = eq(group.id, 'F-MEM', 'کارخانه مموری فوم', 'تولید', { category: 'کارخانه', criticality: 'critical', healthScore: 88 });
  const memChidman = eq(memFactory.id, 'B2-CHID', 'چیدمان فوم', 'تولید', { category: 'دپارتمان', healthScore: 86 });
  const memAnbar = eq(memFactory.id, 'B2-ANB', 'انبار فوم', 'انبار', { category: 'دپارتمان', healthScore: 90 });
  const memMahote = eq(memFactory.id, 'B2-MAHV', 'محوطه مموری', 'تأسیسات', { category: 'دپارتمان' });
  const memVorudi = eq(memFactory.id, 'B2-VOR', 'ورودی انبار', 'انبار', { category: 'دپارتمان' });

  // Conveyors in چیدمان فوم
  const memConv1 = eqFull(memChidman.id, 'B2P01', 'کانوایر ۹ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '9 متری', serial: 'CV09-24001',
    location: 'چیدمان فوم', healthScore: 92, rulDays: 1095,
    customFields: { 'شماره شناسنامه': 'FE-016', 'کد PM': 'B2P01', 'دوره کالیبراسیون': 'نیاز ندارد', 'نوع کالیبراسیون': '—', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv2 = eqFull(memChidman.id, 'B2P02', 'کانوایر ۶ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24002',
    location: 'چیدمان فوم', healthScore: 90, rulDays: 1095,
    customFields: { 'شماره شناسنامه': 'FE-017', 'کد PM': 'B2P02', 'دوره کالیبراسیون': 'نیاز ندارد', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv3 = eqFull(memChidman.id, 'B2P03', 'کانوایر ۶ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24003',
    location: 'چیدمان فوم', healthScore: 89,
    customFields: { 'شماره شناسنامه': 'FE-018', 'کد PM': 'B2P03', 'دوره کالیبراسیون': 'نیاز ندارد', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv4 = eqFull(memChidman.id, 'B2P04', 'کانوایر ۶ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24004',
    location: 'چیدمان فوم', healthScore: 88,
    customFields: { 'شماره شناسنامه': 'FE-019', 'کد PM': 'B2P04', 'دوره کالیبراسیون': 'نیاز ندارد', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv5 = eqFull(memChidman.id, 'B2P05', 'کانوایر ۶ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24005',
    location: 'چیدمان فوم', healthScore: 91,
    customFields: { 'شماره شناسنامه': 'FE-020', 'کد PM': 'B2P05', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv6 = eqFull(memChidman.id, 'B2P06', 'کانوایر ۶ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24006',
    location: 'چیدمان فوم', healthScore: 90,
    customFields: { 'شماره شناسنامه': 'FE-021', 'کد PM': 'B2P06', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });
  const memConv7 = eqFull(memChidman.id, 'B2P07', 'کانوایر ۱۲ متری', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '12 متری', serial: 'CV12-24007',
    location: 'چیدمان فوم', healthScore: 89, rulDays: 1095,
    customFields: { 'شماره شناسنامه': 'FE-022', 'کد PM': 'B2P07', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / مسئول تعمیر و نگهداری' },
  });

  // Conveyors in انبار فوم
  const memConv8 = eqFull(memAnbar.id, 'B2P08', 'کانوایر ۳ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '3 متری', serial: 'CV03-24008',
    location: 'انبار فوم', healthScore: 93,
    customFields: { 'شماره شناسنامه': 'FE-023', 'کد PM': 'B2P08', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });
  const memConv9 = eqFull(memAnbar.id, 'B2P09', 'کانوایر ۶ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24009',
    location: 'انبار فوم', healthScore: 91,
    customFields: { 'شماره شناسنامه': 'FE-024', 'کد PM': 'B2P09', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });
  const memConv10 = eqFull(memAnbar.id, 'B2P10', 'کانوایر ۶ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24010',
    location: 'انبار فوم', healthScore: 92,
    customFields: { 'شماره شناسنامه': 'FE-025', 'کد PM': 'B2P10', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });
  const memConv11 = eqFull(memAnbar.id, 'B2P11', 'کانوایر ۶ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24011',
    location: 'انبار فوم', healthScore: 88,
    customFields: { 'شماره شناسنامه': 'FE-026', 'کد PM': 'B2P11', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });
  const memConv12 = eqFull(memAnbar.id, 'B2P12', 'کانوایر ۶ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24012',
    location: 'انبار فوم', healthScore: 90,
    customFields: { 'شماره شناسنامه': 'FE-027', 'کد PM': 'B2P12', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });
  const memConv13 = eqFull(memAnbar.id, 'B2P13', 'کانوایر ۶ متری', 'انبار', {
    category: 'ماشین', manufacturer: 'ایران', model: '6 متری', serial: 'CV06-24013',
    location: 'انبار فوم', healthScore: 89,
    customFields: { 'شماره شناسنامه': 'FE-028', 'کد PM': 'B2P13', 'PM': 'دارد', 'سمت مجاز به کار': 'انباردار / مسئول تعمیر و نگهداری' },
  });

  // Coolers (Memory Foam)
  const memCool1 = eqFull(memChidman.id, 'B2P14', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24001',
    location: 'چیدمان فوم', healthScore: 85,
    customFields: { 'شماره شناسنامه': 'FE-029', 'کد PM': 'B2P14', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memCool2 = eqFull(memChidman.id, 'B2P15', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24002',
    location: 'چیدمان فوم', healthScore: 86,
    customFields: { 'شماره شناسنامه': 'FE-030', 'کد PM': 'B2P15', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memCool3 = eqFull(memChidman.id, 'B2P16', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24003',
    location: 'چیدمان فوم', healthScore: 84,
    customFields: { 'شماره شناسنامه': 'FE-031', 'کد PM': 'B2P16', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memCool4 = eqFull(memChidman.id, 'B2P17', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24004',
    location: 'چیدمان فوم', healthScore: 87,
    customFields: { 'شماره شناسنامه': 'FE-032', 'کد PM': 'B2P17', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memCool5 = eqFull(memChidman.id, 'B2P18', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24005',
    location: 'چیدمان فوم', healthScore: 85,
    customFields: { 'شماره شناسنامه': 'FE-033', 'کد PM': 'B2P18', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memCool6 = eqFull(memChidman.id, 'B2P19', 'کولر آبی ۱۳۰۰۰', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: '13000', serial: 'CL13-24006',
    location: 'چیدمان فوم', healthScore: 88,
    customFields: { 'شماره شناسنامه': 'FE-034', 'کد PM': 'B2P19', 'PM': 'دارد', 'سمت مجاز به کار': 'پرسنل تولید / مسئول تعمیر و نگهداری' },
  });
  const memDoor = eqFull(memVorudi.id, 'B2P20', 'درب ورودی ریلی', 'انبار', {
    category: 'ماشین', manufacturer: 'ایتالیا', model: 'NICE', serial: 'NC-24001',
    location: 'ورودی انبار', healthScore: 90,
    customFields: { 'شماره شناسنامه': 'FE-037', 'کد PM': 'B2P20', 'PM': 'دارد', 'سمت مجاز به کار': 'نگهبان / مسئول تعمیر و نگهداری' },
  });
  const memFire = eqFull(memMahote.id, 'B2F01', 'سیستم آتش‌نشانی فوم', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: 'Fire Foam System', serial: 'FFS-24001',
    location: 'محوطه مموری', healthScore: 95, criticality: 'critical',
    customFields: { 'شماره شناسنامه': 'FE-038', 'کد PM': 'B2F01', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'مسئول HSE / مسئول تعمیر و نگهداری' },
  });

  // ============= کارخانه ۲: فوم (Polyurethane Foam) =============
  const foamFactory = eq(group.id, 'F-FOAM', 'کارخانه فوم پلی‌یورتان', 'تولید', { category: 'کارخانه', criticality: 'critical', healthScore: 89 });
  const foamLine1 = eq(foamFactory.id, 'F1-LINE', 'خط تولید فوم شماره ۱', 'تولید', { category: 'خط تولید', criticality: 'critical', healthScore: 85 });
  const foamUtil = eq(foamFactory.id, 'F1-UTIL', 'یوتیلیتی فوم', 'تأسیسات', { category: 'دپارتمان' });

  const puInjection = eqFull(foamLine1.id, 'AST-B1P01', 'دستگاه تزریق پلی‌یورتان شماره ۱', 'تولید', {
    category: 'ماشین', manufacturer: 'MAMIX', model: 'MAMIX 28/28', serial: 'MX2828-21001',
    year: 2021, purchaseDate: '2022-06-05',
    location: 'سالن تولید فوم', criticality: 'critical', healthScore: 87, rulDays: 1825,
    purchaseCost: 18_500_000_000,
    capacity: '28 لیتر در دقیقه', power: '45 kW', voltage: '380V',
    customFields: {
      'شماره شناسنامه تجهیز': 'FE-001',
      'کد دارایی': 'AST-B1P01',
      'کد PM': 'B1P01',
      'نام انگلیسی': 'PU Injection Machine',
      'کشور سازنده': 'کره جنوبی',
      'سال نصب': '2022',
      'تاریخ راه‌اندازی': '1401/03/15',
      'فرکانس': '50Hz',
      'فشار کاری': '180 bar',
      'شماره تابلو برق': 'MDB-F01',
      'خط تولید': 'خط تولید فوم شماره 1',
      'واحد بهره‌بردار': 'تولید',
      'مسئول تجهیز': 'مدیر تولید',
      'اپراتور مجاز': 'اپراتور تزریق',
      'سطح اهمیت': 'A (بحرانی)',
      'ریسک توقف': 'زیاد',
      'برنامه PM': 'ماهانه',
      'نوع PM': 'پیشگیرانه',
      'آخرین PM': '1405/03/15',
      'PM بعدی': '1405/04/15',
      'نیاز به کالیبراسیون': 'دارد',
      'دوره کالیبراسیون': '12 ماه',
      'نوع کالیبراسیون': 'خارجی',
      'آخرین کالیبراسیون': '1405/01/20',
      'تاریخ انقضا': '1406/01/20',
      'وضعیت کالیبراسیون': 'معتبر',
      'شرکت کالیبره‌کننده': 'آزمایشگاه تأیید صلاحیت‌شده',
      'شماره گواهی کالیبراسیون': 'CAL-250120-001',
      'دفترچه راهنما': 'دارد',
      'توضیحات': 'بازرسی روزانه قبل از شروع تولید',
    },
  });

  // ============= کارخانه ۳: اسفنج (Sponge / Polyurethane) =============
  const spongeFactory = eq(group.id, 'F-SPG', 'کارخانه اسفنج', 'تولید', { category: 'کارخانه', criticality: 'critical', healthScore: 91 });
  const spongeMahote = eq(spongeFactory.id, 'B3-MAHV', 'محوطه اسفنج', 'تأسیسات', { category: 'دپارتمان' });
  const spongeProduction = eq(spongeFactory.id, 'B3-PROD', 'سالن تولید اسفنج', 'تولید', { category: 'دپارتمان', criticality: 'critical' });
  const spongeUnit = eq(spongeFactory.id, 'B3-UNIT', 'واحد اسفنج', 'تولید', { category: 'دپارتمان' });

  const sDoor1 = eqFull(spongeMahote.id, 'B3AD2', 'درب ریلی خیابان دوم', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: 'ریلی اتومات', serial: 'AD2-24001',
    location: 'محوطه اسفنج', healthScore: 88,
    customFields: { 'شماره شناسنامه': 'FE-039', 'کد PM': 'B3AD2', 'PM': 'دارد', 'سمت مجاز به کار': 'نگهبان / مسئول تعمیر و نگهداری' },
  });
  const sDoor2 = eqFull(spongeMahote.id, 'B3AD4', 'درب ریلی خیابان چهارم', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: 'ریلی اتومات', serial: 'AD4-24001',
    location: 'محوطه اسفنج', healthScore: 89,
    customFields: { 'شماره شناسنامه': 'FE-040', 'کد PM': 'B3AD4', 'PM': 'دارد', 'سمت مجاز به کار': 'نگهبان / مسئول تعمیر و نگهداری' },
  });
  const sGenerator = eqFull(spongeMahote.id, 'B3AF1', 'دیزل ژنراتور اسفنج', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'آمریکا/بریتانیا', model: 'Cummins 500 kVA', serial: 'CM500-21001',
    location: 'محوطه اسفنج', criticality: 'high', healthScore: 86, year: 2021,
    power: '500 kVA',
    customFields: { 'شماره شناسنامه': 'FE-041', 'کد PM': 'B3AF1', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست فنی / مسئول تعمیر و نگهداری' },
  });
  const sFire = eqFull(spongeMahote.id, 'B3Fire', 'سیستم آتش‌نشانی اسفنج', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: 'Fire Foam System', serial: 'FFS-24002',
    location: 'محوطه اسفنج', criticality: 'critical', healthScore: 94,
    customFields: { 'شماره شناسنامه': 'FE-042', 'کد PM': 'B3Fire', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست فنی / مسئول تعمیر و نگهداری' },
  });
  const sFoamMachine = eqFull(spongeProduction.id, 'B3P1', 'دستگاه تولید اسفنج', 'تولید', {
    category: 'ماشین', manufacturer: 'نروژ', model: 'Hennecke Continuous Line', serial: 'HNK-22001',
    location: 'سالن تولید اسفنج', criticality: 'critical', healthScore: 84, year: 2022, purchaseCost: 95_000_000_000,
    customFields: { 'شماره شناسنامه': 'FE-043', 'کد PM': 'B3P1', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'مدیر کارخانه / مدیر تولید / سرپرست تولید' },
  });
  const sChiller = eqFull(spongeProduction.id, 'B3PF1', 'چیلر تولید اسفنج', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'آلمان', model: '120 تن', serial: 'CH120-22001',
    location: 'سالن تولید اسفنج', criticality: 'critical', healthScore: 89, year: 2022,
    capacity: '120 تن',
    customFields: { 'شماره شناسنامه': 'FE-044', 'کد PM': 'B3PF1', 'PC': '✓', 'دوره کالیبراسیون': '3 ماهه', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'مدیر و سرپرست تولید اسفنج' },
  });
  const sBoiler = eqFull(spongeProduction.id, 'B3PF2', 'دیگ آب گرم اسفنج', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: '120 تن', serial: 'BLR120-22001',
    location: 'سالن تولید اسفنج', criticality: 'critical', healthScore: 87, year: 2022,
    capacity: '120 تن',
    customFields: { 'شماره شناسنامه': 'FE-045', 'کد PM': 'B3PF2', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'مدیر و سرپرست تولید اسفنج' },
  });
  const sCompressor = eqFull(spongeProduction.id, 'B3PF3', 'کمپرسور هوای فشرده', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'آلمان', model: '5000 L', serial: 'CP5000-22001',
    location: 'سالن تولید اسفنج', criticality: 'high', healthScore: 88, year: 2022,
    capacity: '5000 لیتر',
    customFields: { 'شماره شناسنامه': 'FE-046', 'کد PM': 'B3PF3', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'مدیر و سرپرست تولید اسفنج' },
  });
  const sDryer = eqFull(spongeProduction.id, 'B3PF3-1', 'درایر هوای فشرده', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'آلمان', model: 'تبریدی', serial: 'DRY-22001',
    location: 'سالن تولید اسفنج', healthScore: 90, year: 2022,
    customFields: { 'شماره شناسنامه': 'FE-047', 'کد PM': 'B3PF3-1', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'مدیر و سرپرست تولید اسفنج' },
  });
  const sForklift = eqFull(spongeUnit.id, 'B3BT1', 'لیفتراک کوماتسو', 'تولید', {
    category: 'ماشین', manufacturer: 'ژاپن', model: '2.5 تن', serial: 'KM25-23001',
    location: 'واحد اسفنج', healthScore: 92, year: 2023, capacity: '2.5 تن',
    customFields: { 'شماره شناسنامه': 'FE-048', 'کد PM': 'B3BT1', 'PM': 'دارد', 'سمت مجاز به کار': 'سرپرست تولید / راننده لیفتراک' },
  });

  // ============= کارخانه ۴: برش اسفنج (Sponge Cutting) =============
  const cutFactory = eq(group.id, 'F-CUT', 'کارخانه برش اسفنج', 'تولید', { category: 'کارخانه', criticality: 'high', healthScore: 88 });
  const cutHall = eq(cutFactory.id, 'B3-CUTHALL', 'سالن برش اسفنج', 'تولید', { category: 'دپارتمان', healthScore: 87 });

  const cutH = eqFull(cutHall.id, 'B3CUT3', 'دستگاه برش افقی', 'تولید', {
    category: 'ماشین', manufacturer: 'چین', model: 'افقی', serial: '7LPQ1650',
    location: 'سالن برش اسفنج', criticality: 'high', healthScore: 85,
    customFields: { 'شماره شناسنامه': 'FE-049', 'کد PM': 'B3CUT3', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'برشکار / سرپرست تولید' },
  });
  const cutV = eqFull(cutHall.id, 'B3CUT4', 'دستگاه برش عمودی', 'تولید', {
    category: 'ماشین', manufacturer: 'چین', model: 'عمودی', serial: '110710W',
    location: 'سالن برش اسفنج', criticality: 'high', healthScore: 86,
    customFields: { 'شماره شناسنامه': 'FE-050', 'کد PM': 'B3CUT4', 'PC': '✓', 'دوره کالیبراسیون': '12 ماهه', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'برشکار / سرپرست تولید' },
  });
  const cutR2 = eqFull(cutHall.id, 'B3CUT2', 'دستگاه برش گردبر ۲', 'تولید', {
    category: 'ماشین', manufacturer: 'ایران', model: 'گردبر 2', serial: 'CUT2-24001',
    location: 'سالن برش اسفنج', healthScore: 88,
    customFields: { 'شماره شناسنامه': 'FE-051', 'کد PM': 'B3CUT2', 'PM': 'دارد', 'سمت مجاز به کار': 'برشکار' },
  });
  const cutR3 = eqFull(cutHall.id, 'B3CUT1', 'دستگاه برش گردبر ۳', 'تولید', {
    category: 'ماشین', manufacturer: 'تایوان', model: 'گردبر 3', serial: 'CUT3-24001',
    location: 'سالن برش اسفنج', healthScore: 89,
    customFields: { 'شماره شناسنامه': 'FE-052', 'کد PM': 'B3CUT1', 'PM': 'دارد', 'سمت مجاز به کار': 'برشکار' },
  });
  const cutAir = eqFull(cutHall.id, 'B3CUT-AIR', 'کمپرسور هوا آبی ۲۵۰ لیتر', 'تأسیسات', {
    category: 'ماشین', manufacturer: 'ایران', model: 'آبی 250 لیتر', serial: 'CP250-24001',
    location: 'سالن برش اسفنج', healthScore: 87, capacity: '250 لیتر',
    customFields: { 'شماره شناسنامه': 'FE-053', 'کد PM': 'B3CUT-AIR', 'PM': 'دارد', 'سمت مجاز به کار': 'برشکار / مسئول تعمیر و نگهداری' },
  });

  // ============= آزمایشگاه کنترل کیفیت =============
  const labFactory = eq(group.id, 'F-LAB', 'آزمایشگاه کنترل کیفیت', 'کیفیت', { category: 'دپارتمان', criticality: 'high', healthScore: 95 });

  const labTensile = eqFull(labFactory.id, 'SC-119', 'دستگاه تست کشش (Tensile Testing Machine)', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'چین', model: 'Universal Tensile Tester', serial: 'TTM-24001',
    location: 'آزمایشگاه', criticality: 'high', healthScore: 95,
    customFields: { 'شماره شناسنامه': 'FE-061', 'کد PM': 'SC-119', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه / مدیر کنترل کیفیت' },
  });
  const labScale = eqFull(labFactory.id, 'SC-120', 'ترازوی آزمایشگاهی', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'ژاپن', model: 'AND GF-400', serial: 'GF400-24001',
    location: 'آزمایشگاه', healthScore: 96,
    customFields: { 'شماره شناسنامه': 'FE-062', 'کد PM': 'SC-120', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labMantle = eqFull(labFactory.id, 'SC-122', 'شوف بالن', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'آلمان', model: 'Heating Mantle', serial: 'HM-24001',
    location: 'آزمایشگاه', healthScore: 94,
    customFields: { 'شماره شناسنامه': 'FE-063', 'کد PM': 'SC-122', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labHotPlate1 = eqFull(labFactory.id, 'SC-123', 'هات پلیت همزن‌دار ۱', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'آلمان', model: 'MR HEI-TEC', serial: 'MRHT-24001',
    location: 'آزمایشگاه', healthScore: 95,
    customFields: { 'شماره شناسنامه': 'FE-064', 'کد PM': 'SC-123', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labHotPlate2 = eqFull(labFactory.id, 'SC-124', 'هات پلیت همزن‌دار ۲', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'آلمان', model: 'MR HEI-TEC', serial: 'MRHT-24002',
    location: 'آزمایشگاه', healthScore: 93,
    customFields: { 'شماره شناسنامه': 'FE-065', 'کد PM': 'SC-124', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labOven = eqFull(labFactory.id, 'SC-118', 'آون آزمایشگاهی', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'آلمان', model: 'Laboratory Oven', serial: 'OV-24001',
    location: 'آزمایشگاه', healthScore: 94,
    customFields: { 'شماره شناسنامه': 'FE-066', 'کد PM': 'SC-118', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labThermoProbe = eqFull(labFactory.id, 'SC-117', 'ترمومتر پراب‌دار', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'آلمان', model: 'TESTO 925', serial: 'TS925-24001',
    location: 'آزمایشگاه', healthScore: 96,
    customFields: { 'شماره شناسنامه': 'FE-067', 'کد PM': 'SC-117', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labCaliper = eqFull(labFactory.id, 'SC-125', 'کولیس دیجیتال', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'چین', model: 'Guanglu 0–300 mm', serial: 'GL300-24001',
    location: 'آزمایشگاه', healthScore: 97,
    customFields: { 'شماره شناسنامه': 'FE-068', 'کد PM': 'SC-125', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labLaserTherm = eqFull(labFactory.id, 'SC-126', 'دماسنج لیزری', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'چین', model: 'TD360', serial: 'TD360-24001',
    location: 'آزمایشگاه', healthScore: 95,
    customFields: { 'شماره شناسنامه': 'FE-069', 'کد PM': 'SC-126', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'خارجی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labAir1 = eqFull(labFactory.id, 'SC-127', 'دستگاه عبور هوا شماره ۱', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'ایران', model: 'Air Permeability Tester', serial: 'APT-24001',
    location: 'آزمایشگاه', healthScore: 92,
    customFields: { 'شماره شناسنامه': 'FE-070', 'کد PM': 'SC-127', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labAir2 = eqFull(labFactory.id, 'SC-128', 'دستگاه عبور هوا شماره ۲', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'ایران', model: 'Air Permeability Tester', serial: 'APT-24002',
    location: 'آزمایشگاه', healthScore: 93,
    customFields: { 'شماره شناسنامه': 'FE-071', 'کد PM': 'SC-128', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه' },
  });
  const labBall = eqFull(labFactory.id, 'SC-129', 'دستگاه تست خاصیت ارتجاعی', 'کیفیت', {
    category: 'تجهیز آزمایشگاهی', manufacturer: 'ایران', model: 'Ball Rebound Tester', serial: 'BRT-24001',
    location: 'آزمایشگاه', healthScore: 94,
    customFields: { 'شماره شناسنامه': 'FE-072', 'کد PM': 'SC-129', 'PC': '✓', 'دوره کالیبراسیون': '1 ساله', 'نوع کالیبراسیون': 'داخلی', 'PM': 'دارد', 'سمت مجاز به کار': 'کارشناس آزمایشگاه / مدیر کنترل کیفیت' },
  });

  return [
    group,
    // مموری فوم
    memFactory, memChidman, memAnbar, memMahote, memVorudi,
    memConv1, memConv2, memConv3, memConv4, memConv5, memConv6, memConv7,
    memConv8, memConv9, memConv10, memConv11, memConv12, memConv13,
    memCool1, memCool2, memCool3, memCool4, memCool5, memCool6,
    memDoor, memFire,
    // فوم
    foamFactory, foamLine1, foamUtil, puInjection,
    // اسفنج
    spongeFactory, spongeMahote, spongeProduction, spongeUnit,
    sDoor1, sDoor2, sGenerator, sFire, sFoamMachine,
    sChiller, sBoiler, sCompressor, sDryer, sForklift,
    // برش
    cutFactory, cutHall, cutH, cutV, cutR2, cutR3, cutAir,
    // آزمایشگاه
    labFactory, labTensile, labScale, labMantle, labHotPlate1, labHotPlate2,
    labOven, labThermoProbe, labCaliper, labLaserTherm, labAir1, labAir2, labBall,
  ];
})();

export const seedSuppliers: Supplier[] = [
  { id: 's1', name: 'پارس صنعت غرب', contact: 'آقای محمدی', phone: '۰۸۳۳۳۳۳۴۴۵۵', email: 'sales@parssanat.ir', rating: 4.6, leadDays: 7 },
  { id: 's2', name: 'تأمین کالای صنعتی ایران', contact: 'خانم نوری', phone: '۰۲۱۸۸۷۷۶۶۵۵', email: 'info@iranind.ir', rating: 4.2, leadDays: 14 },
  { id: 's3', name: 'بازرگانی اروپایی فاطر', contact: 'آقای صفری', phone: '۰۲۱۲۲۳۳۴۴۵۵', email: 'sales@faterco.com', rating: 4.8, leadDays: 30 },
];

export const seedParts: SparePart[] = [
  { id: 'p1', code: 'BRG-6205', name: 'بلبرینگ SKF 6205', category: 'بلبرینگ', unit: 'عدد', unitCost: 320000, stock: 24, min: 10, max: 50, warehouse: 'انبار مرکزی', bin: 'A-12', supplierId: 's1', consumptionForecast30: 8, consumptionForecast90: 22 },
  { id: 'p2', code: 'SEAL-OR-45', name: 'اورینگ ۴۵ میلیمتر', category: 'آب‌بندی', unit: 'عدد', unitCost: 25000, stock: 4, min: 20, max: 100, warehouse: 'انبار مرکزی', bin: 'B-03', supplierId: 's1', consumptionForecast30: 30, consumptionForecast90: 80 },
  { id: 'p3', code: 'OIL-ISO68', name: 'روغن هیدرولیک ISO 68', category: 'روان‌کار', unit: 'لیتر', unitCost: 180000, stock: 320, min: 100, max: 500, warehouse: 'انبار شیمیایی', bin: 'OIL-1', supplierId: 's2', consumptionForecast30: 60, consumptionForecast90: 180 },
  { id: 'p4', code: 'CNT-LC1D', name: 'کنتاکتور اشنایدر LC1D32', category: 'برقی', unit: 'عدد', unitCost: 1850000, stock: 2, min: 5, max: 20, warehouse: 'انبار برق', bin: 'E-22', supplierId: 's3', consumptionForecast30: 3, consumptionForecast90: 7 },
  { id: 'p5', code: 'FLT-AIR-100', name: 'فیلتر هوا کمپرسور Atlas', category: 'فیلتر', unit: 'عدد', unitCost: 4500000, stock: 6, min: 2, max: 12, warehouse: 'انبار مرکزی', bin: 'F-08', supplierId: 's3', consumptionForecast30: 2, consumptionForecast90: 5 },
  { id: 'p6', code: 'BLT-A60', name: 'تسمه V نوع A60', category: 'انتقال قدرت', unit: 'عدد', unitCost: 220000, stock: 15, min: 8, max: 40, warehouse: 'انبار مرکزی', bin: 'C-15', supplierId: 's1', consumptionForecast30: 6, consumptionForecast90: 18 },
  { id: 'p7', code: 'VLV-SOL-24', name: 'شیر سولنوئیدی ۲۴VDC', category: 'پنوماتیک', unit: 'عدد', unitCost: 1250000, stock: 3, min: 4, max: 15, warehouse: 'انبار برق', bin: 'E-30', supplierId: 's3', consumptionForecast30: 2, consumptionForecast90: 6 },
  { id: 'p8', code: 'GRS-EP2', name: 'گریس EP2', category: 'روان‌کار', unit: 'کیلوگرم', unitCost: 280000, stock: 45, min: 20, max: 100, warehouse: 'انبار شیمیایی', bin: 'GRS-2', supplierId: 's2', consumptionForecast30: 12, consumptionForecast90: 35 },
];

const today = new Date();
const addDays = (d: number) => new Date(today.getTime() + d * 86400000).toISOString();

// SAFE lookup: returns equipment ID by code, or falls back to first equipment, never crashes
function eqId(code: string): string {
  const found = seedEquipment.find(e => e.code === code);
  return found ? found.id : (seedEquipment[0]?.id ?? '');
}

export const seedWOs: WorkOrder[] = [
  {
    id: 'wo1', number: 'WO-1405-0521', title: 'تعمیر کانوایر ۹ متری چیدمان فوم',
    description: 'سرعت کانوایر کاهش پیدا کرده و صدای غیرعادی از موتور می‌آید. نیاز به بازرسی فوری.',
    type: 'corrective', priority: 'high', status: 'in_progress',
    equipmentId: eqId('B2P01'),
    department: 'تولید', requestedBy: 'u_sup1', assignedTo: ['u_tech1'],
    plannedStart: addDays(-1), plannedEnd: addDays(0), actualStart: addDays(-1),
    estimatedCost: 4_500_000, actualCost: 0, laborHours: 4,
    partsUsed: [{ partId: 'p2', qty: 2 }, { partId: 'p3', qty: 5 }],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    viewedAt: [{ userId: 'u_tech1', at: addDays(-1) }],
    createdAt: addDays(-2), updatedAt: addDays(-1),
  },
  {
    id: 'wo2', number: 'WO-1405-0522', title: 'PM ماهانه دستگاه تولید اسفنج Hennecke',
    description: 'بازرسی، روان‌کاری، تنظیم تنش تسمه‌ها، تست عملکرد سنسورها',
    type: 'preventive', priority: 'medium', status: 'assigned',
    equipmentId: eqId('B3P1'),
    department: 'تولید', requestedBy: 'u_mng', assignedTo: ['u_tech1', 'u_tech2'],
    plannedStart: addDays(2), plannedEnd: addDays(2),
    estimatedCost: 2_000_000, actualCost: 0, laborHours: 6,
    partsUsed: [{ partId: 'p8', qty: 1 }, { partId: 'p6', qty: 2 }],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    createdAt: addDays(-5), updatedAt: addDays(-1),
  },
  {
    id: 'wo3', number: 'WO-1405-0523', title: 'خرابی اضطراری: قطع فاز دیزل ژنراتور اسفنج',
    description: 'سیستم محافظت ژنراتور وارد عمل شده و واحد متوقف شد. نیاز به بررسی فوری.',
    type: 'emergency', priority: 'critical', status: 'completed',
    equipmentId: eqId('B3AF1'),
    department: 'برق', requestedBy: 'u_sup1', assignedTo: ['u_tech2'],
    plannedStart: addDays(-7), plannedEnd: addDays(-7), actualStart: addDays(-7), actualEnd: addDays(-7),
    estimatedCost: 8_000_000, actualCost: 12_500_000, laborHours: 8,
    partsUsed: [{ partId: 'p4', qty: 1 }],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    rootCause: 'فرسودگی کنتاکتور اصلی و عدم تعویض به موقع',
    correctiveAction: 'تعویض کنتاکتور و به‌روزرسانی برنامه PM',
    createdAt: addDays(-7), updatedAt: addDays(-7),
  },
  {
    id: 'wo4', number: 'WO-1405-0524', title: 'بازرسی هفتگی کمپرسور هوای فشرده اسفنج',
    description: 'چک کردن سطح روغن، فیلتر هوا، فشار خروجی، دما',
    type: 'inspection', priority: 'medium', status: 'submitted',
    equipmentId: eqId('B3PF3'),
    department: 'تأسیسات', requestedBy: 'u_mng', assignedTo: ['u_tech3'],
    plannedStart: addDays(1), plannedEnd: addDays(1),
    estimatedCost: 500_000, actualCost: 0, laborHours: 2,
    partsUsed: [],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    createdAt: addDays(-1), updatedAt: addDays(-1),
  },
  {
    id: 'wo5', number: 'WO-1405-0525', title: 'تعویض فیلتر هوای کمپرسور سالن برش',
    description: 'فیلتر هوا به انتهای عمر مفید رسیده و فشار افت پیدا کرده',
    type: 'preventive', priority: 'low', status: 'draft',
    equipmentId: eqId('B3CUT-AIR'),
    department: 'تأسیسات', requestedBy: 'u_tech3', assignedTo: [],
    plannedStart: addDays(5), plannedEnd: addDays(5),
    estimatedCost: 5_000_000, actualCost: 0, laborHours: 1,
    partsUsed: [{ partId: 'p5', qty: 1 }],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    createdAt: addDays(0), updatedAt: addDays(0),
  },
  {
    id: 'wo6', number: 'WO-1405-0526', title: 'PM ماهانه دستگاه تزریق پلی‌یورتان',
    description: 'بازرسی فشار کاری ۱۸۰ bar، چک ولتاژ ۳۸۰V، تست نسبت اختلاط، روان‌کاری یاتاقان‌ها',
    type: 'preventive', priority: 'critical', status: 'approved',
    equipmentId: eqId('AST-B1P01'),
    department: 'تولید', requestedBy: 'u_mng', assignedTo: ['u_tech1', 'u_tech2'],
    plannedStart: addDays(3), plannedEnd: addDays(3),
    estimatedCost: 6_500_000, actualCost: 0, laborHours: 8,
    partsUsed: [{ partId: 'p8', qty: 2 }, { partId: 'p3', qty: 10 }],
    attachmentsBefore: [], attachmentsAfter: [], voiceNotes: [], textNotes: [],
    createdAt: addDays(0), updatedAt: addDays(0),
  },
];

export const seedPMs: PMPlan[] = [
  {
    id: 'pm1', name: 'روان‌کاری ماهانه دستگاه تزریق PU', equipmentId: eqId('AST-B1P01'),
    frequency: 'monthly', taskType: 'lubrication',
    checklist: [
      { item: 'تخلیه گریس قدیمی از یاتاقان‌ها', done: false },
      { item: 'تزریق گریس EP2 با مقدار مشخص', done: false },
      { item: 'بررسی صدا و لرزش بعد از روان‌کاری', done: false },
      { item: 'ثبت ساعت کارکرد در لاگ', done: false },
    ],
    assignedTo: 'u_tech1', nextDue: addDays(3), lastDone: addDays(-27), compliance: 92, active: true,
  },
  {
    id: 'pm2', name: 'بازرسی هفتگی کمپرسور هوای فشرده اسفنج', equipmentId: eqId('B3PF3'),
    frequency: 'weekly', taskType: 'inspection',
    checklist: [
      { item: 'بررسی سطح روغن', done: false },
      { item: 'بررسی فشار خروجی', done: false },
      { item: 'بررسی دمای عملکرد', done: false },
      { item: 'بررسی نشتی هوا و روغن', done: false },
    ],
    assignedTo: 'u_tech3', nextDue: addDays(1), lastDone: addDays(-6), compliance: 88, active: true,
  },
  {
    id: 'pm3', name: 'کالیبراسیون چیلر تولید اسفنج', equipmentId: eqId('B3PF1'),
    frequency: 'quarterly', taskType: 'calibration',
    checklist: [
      { item: 'مقایسه با ترموکوپل مرجع', done: false },
      { item: 'تنظیم آفست در PLC', done: false },
      { item: 'صدور گواهی کالیبراسیون', done: false },
    ],
    assignedTo: 'u_tech2', nextDue: addDays(15), compliance: 100, active: true,
  },
  {
    id: 'pm4', name: 'بازرسی سالیانه دیزل ژنراتور اسفنج', equipmentId: eqId('B3AF1'),
    frequency: 'annual', taskType: 'inspection',
    checklist: [
      { item: 'تست عایقی', done: false },
      { item: 'تست روغن', done: false },
      { item: 'بازرسی سیلیکاژل', done: false },
      { item: 'گزارش رسمی', done: false },
    ],
    assignedTo: 'u_tech2', nextDue: addDays(120), compliance: 100, active: true,
  },
  {
    id: 'pm5', name: 'تست ماهانه سیستم آتش‌نشانی مموری', equipmentId: eqId('B2F01'),
    frequency: 'monthly', taskType: 'testing',
    checklist: [
      { item: 'تست فشار مخزن', done: false },
      { item: 'تست عملکرد پمپ', done: false },
      { item: 'تست سنسورهای دود/حرارت', done: false },
      { item: 'تست سیستم اعلام', done: false },
    ],
    assignedTo: 'u_tech3', nextDue: addDays(7), compliance: 95, active: true,
  },
];

export const seedNotifications: Notification[] = [
  { id: uid('n'), type: 'wo_overdue', title: 'دستور کار معوق', body: 'WO-1402-0521 از موعد گذشته است', at: addDays(-0.2), read: false, channel: ['inapp', 'email', 'whatsapp'] },
  { id: uid('n'), type: 'pm_due', title: 'PM امروز', body: 'بازرسی هفتگی کمپرسور امروز سررسید دارد', at: addDays(-0.5), read: false, channel: ['inapp', 'push'] },
  { id: uid('n'), type: 'inventory_low', title: 'موجودی پایین', body: 'اورینگ ۴۵ میلیمتر زیر حداقل موجودی است', at: addDays(-1), read: false, channel: ['inapp', 'email'] },
  { id: uid('n'), type: 'ai_insight', title: 'هشدار هوش مصنوعی', body: 'احتمال خرابی پمپ MDI در ۹ روز آینده ۷۸٪', at: addDays(-1.5), read: true, channel: ['inapp', 'whatsapp', 'bale'] },
  { id: uid('n'), type: 'approval', title: 'نیاز به تأیید', body: 'دستور کار WO-1402-0524 منتظر تأیید شماست', at: addDays(-0.8), read: false, channel: ['inapp'] },
];

export const seedExcel: ExcelFile[] = [
  { id: 'x1', name: 'لیست تجهیزات کارخانه.xlsx', size: 245000, version: 3, uploadedBy: 'مهندس کریمی', uploadedAt: addDays(-30), sheets: ['تجهیزات', 'دپارتمان‌ها', 'موقعیت‌ها'], checksum: 'a1b2c3d4...' },
  { id: 'x2', name: 'برنامه PM سالیانه.xlsx', size: 180000, version: 2, uploadedBy: 'مهندس کریمی', uploadedAt: addDays(-15), sheets: ['PM ماهانه', 'PM فصلی', 'PM سالیانه'], checksum: 'e5f6g7h8...' },
  { id: 'x3', name: 'موجودی انبار قطعات.xlsx', size: 320000, version: 5, uploadedBy: 'انبار مرکزی', uploadedAt: addDays(-2), sheets: ['قطعات', 'تأمین‌کنندگان', 'گردش انبار'], checksum: 'i9j0k1l2...' },
];

export const seedAudit: AuditLog[] = [
  { id: uid('a'), user: 'مهندس علی رضایی', action: 'ورود به سیستم', module: 'احراز هویت', at: addDays(-0.1), ip: '192.168.1.45' },
  { id: uid('a'), user: 'مهندس کریمی', action: 'ایجاد دستور کار جدید', module: 'دستور کار', target: 'WO-1402-0524', at: addDays(-1) },
  { id: uid('a'), user: 'سعید موسوی', action: 'مشاهده دستور کار', module: 'دستور کار', target: 'WO-1402-0521', at: addDays(-1) },
  { id: uid('a'), user: 'رضا فتاحی', action: 'تکمیل دستور کار اضطراری', module: 'دستور کار', target: 'WO-1402-0523', at: addDays(-7) },
];
