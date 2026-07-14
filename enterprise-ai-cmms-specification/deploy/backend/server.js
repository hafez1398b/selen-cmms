// =====================================================
// 🚀 Baspar Foam Gharb CMMS — Backend API
// =====================================================
// Node.js + Express + PostgreSQL
// Provides REST API for the CMMS frontend
// =====================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE-THIS-IN-PRODUCTION-baspar-cmms-2025';
const JWT_EXPIRES = '7d';

// ============ Database Pool ============
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'baspar_cmms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => console.error('Unexpected DB error:', err));

// Test connection on startup
pool.query('SELECT NOW()').then(r => console.log('✅ DB connected:', r.rows[0].now))
  .catch(err => { console.error('❌ DB connection failed:', err.message); process.exit(1); });

// ============ Middleware ============
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// ============ Auth Middleware ============
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

// ============ Health Check ============
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', time: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: 'error' });
  }
});

// ============ AUTH ============
app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1) AND active = TRUE', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await pool.query('INSERT INTO audit_log (user_name, action, module) VALUES ($1, $2, $3)',
        [email, 'تلاش ناموفق ورود', 'auth']);
      return res.status(401).json({ error: 'invalid_credentials' });
    }

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
    await pool.query('INSERT INTO audit_log (user_id, user_name, action, module) VALUES ($1, $2, $3, $4)',
      [user.id, user.name, 'ورود موفق', 'auth']);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        department: user.department, jobTitle: user.job_title, avatar: user.avatar,
        mustChangePassword: user.must_change_password,
      },
    });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/auth/change-password', auth, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'weak_password' });
  const hash = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [hash, req.user.id]);
  res.json({ ok: true });
});

// ============ USERS ============
app.get('/api/users', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, role, department, job_title, phone, avatar, skills, performance, active, joined_at, last_login_at FROM users ORDER BY name');
  res.json(rows);
});

app.post('/api/users', auth, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, department, job_title, phone, skills } = req.body;
  const hash = await bcrypt.hash(password || 'Baspar@1234', 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, department, job_title, phone, skills, must_change_password)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE) RETURNING id`,
    [name, email, hash, role, department, job_title, phone, skills || []]
  );
  res.json({ id: rows[0].id });
});

app.put('/api/users/:id', auth, async (req, res) => {
  // Users can update themselves; admin can update anyone
  if (req.user.id !== req.params.id && req.user.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  const { name, phone, department, job_title, skills, avatar, active, role } = req.body;
  await pool.query(
    `UPDATE users SET
       name = COALESCE($2, name), phone = COALESCE($3, phone),
       department = COALESCE($4, department), job_title = COALESCE($5, job_title),
       skills = COALESCE($6, skills), avatar = COALESCE($7, avatar),
       active = COALESCE($8, active), role = COALESCE($9, role)
     WHERE id = $1`,
    [req.params.id, name, phone, department, job_title, skills, avatar, active, role]
  );
  res.json({ ok: true });
});

app.delete('/api/users/:id', auth, requireRole('admin'), async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ============ EQUIPMENT ============
app.get('/api/equipment', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM equipment ORDER BY code');
  res.json(rows);
});

app.get('/api/equipment/:id', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM equipment WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'not_found' });
  const docs = await pool.query('SELECT * FROM equipment_documents WHERE equipment_id = $1', [req.params.id]);
  res.json({ ...rows[0], documents: docs.rows });
});

app.post('/api/equipment', auth, async (req, res) => {
  const e = req.body;
  const { rows } = await pool.query(
    `INSERT INTO equipment (parent_id, code, name, category, department, location, manufacturer, model, serial, year, purchase_date, purchase_cost, status, criticality, health_score, rul_days, capacity, power, voltage, weight, custom_fields)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING id`,
    [e.parent_id, e.code, e.name, e.category, e.department, e.location, e.manufacturer, e.model, e.serial,
     e.year, e.purchase_date, e.purchase_cost, e.status || 'active', e.criticality || 'medium',
     e.health_score || 85, e.rul_days || 720, e.capacity, e.power, e.voltage, e.weight, e.custom_fields || {}]
  );
  res.json({ id: rows[0].id });
});

app.put('/api/equipment/:id', auth, async (req, res) => {
  const e = req.body;
  const cols = ['parent_id', 'code', 'name', 'category', 'department', 'location', 'manufacturer', 'model', 'serial', 'year', 'purchase_date', 'purchase_cost', 'status', 'criticality', 'health_score', 'rul_days', 'notes', 'capacity', 'power', 'voltage', 'weight', 'custom_fields'];
  const updates = [], values = [req.params.id];
  cols.forEach(col => {
    if (e[col] !== undefined) { values.push(e[col]); updates.push(`${col} = $${values.length}`); }
  });
  if (updates.length === 0) return res.json({ ok: true });
  await pool.query(`UPDATE equipment SET ${updates.join(', ')} WHERE id = $1`, values);
  res.json({ ok: true });
});

app.delete('/api/equipment/:id', auth, requireRole('admin', 'manager'), async (req, res) => {
  await pool.query('DELETE FROM equipment WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ============ WORK ORDERS ============
app.get('/api/work-orders', auth, async (req, res) => {
  const { equipment_id, status, limit } = req.query;
  let query = 'SELECT w.*, ARRAY(SELECT user_id FROM wo_assignments WHERE wo_id = w.id) AS assigned_to FROM work_orders w WHERE 1=1';
  const params = [];
  if (equipment_id) { params.push(equipment_id); query += ` AND equipment_id = $${params.length}`; }
  if (status) { params.push(status); query += ` AND status = $${params.length}`; }
  query += ' ORDER BY planned_start DESC';
  if (limit) { params.push(parseInt(limit)); query += ` LIMIT $${params.length}`; }
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

app.post('/api/work-orders', auth, async (req, res) => {
  const w = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO work_orders (number, title, description, type, priority, status, equipment_id, department, requested_by, planned_start, planned_end, estimated_cost, labor_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [w.number, w.title, w.description, w.type, w.priority, w.status || 'draft', w.equipment_id, w.department, req.user.id, w.planned_start, w.planned_end, w.estimated_cost || 0, w.labor_hours || 0]
    );
    const woId = rows[0].id;
    if (w.assigned_to && w.assigned_to.length) {
      for (const uid of w.assigned_to) {
        await client.query('INSERT INTO wo_assignments (wo_id, user_id) VALUES ($1, $2)', [woId, uid]);
      }
    }
    await client.query('COMMIT');
    res.json({ id: woId });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

app.put('/api/work-orders/:id', auth, async (req, res) => {
  const w = req.body;
  const cols = ['title', 'description', 'type', 'priority', 'status', 'equipment_id', 'department', 'planned_start', 'planned_end', 'actual_start', 'actual_end', 'estimated_cost', 'actual_cost', 'labor_hours', 'root_cause', 'corrective_action'];
  const updates = [], values = [req.params.id];
  cols.forEach(col => {
    if (w[col] !== undefined) { values.push(w[col]); updates.push(`${col} = $${values.length}`); }
  });
  if (updates.length > 0) {
    await pool.query(`UPDATE work_orders SET ${updates.join(', ')} WHERE id = $1`, values);
  }
  res.json({ ok: true });
});

// ============ PM PLANS ============
app.get('/api/pm-plans', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM pm_plans ORDER BY next_due');
  res.json(rows);
});

app.post('/api/pm-plans', auth, async (req, res) => {
  const p = req.body;
  const { rows } = await pool.query(
    `INSERT INTO pm_plans (name, equipment_id, frequency, task_type, assigned_to, next_due, compliance, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [p.name, p.equipment_id, p.frequency, p.task_type, p.assigned_to, p.next_due, p.compliance || 100, p.active !== false]
  );
  res.json({ id: rows[0].id });
});

// ============ SPARE PARTS ============
app.get('/api/spare-parts', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM spare_parts ORDER BY code');
  res.json(rows);
});

app.post('/api/spare-parts', auth, async (req, res) => {
  const p = req.body;
  const { rows } = await pool.query(
    `INSERT INTO spare_parts (code, name, category, unit, unit_cost, stock, min_stock, max_stock, warehouse, bin, supplier_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [p.code, p.name, p.category, p.unit || 'عدد', p.unit_cost || 0, p.stock || 0, p.min_stock || 5, p.max_stock || 50, p.warehouse, p.bin, p.supplier_id]
  );
  res.json({ id: rows[0].id });
});

// ============ SUPPLIERS ============
app.get('/api/suppliers', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM suppliers ORDER BY name');
  res.json(rows);
});

app.post('/api/suppliers', auth, async (req, res) => {
  const s = req.body;
  const { rows } = await pool.query(
    `INSERT INTO suppliers (name, contact, phone, email, rating, lead_days) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [s.name, s.contact, s.phone, s.email, s.rating || 4.0, s.lead_days || 7]
  );
  res.json({ id: rows[0].id });
});

// ============ ATTENDANCE ============
app.get('/api/attendance', auth, async (req, res) => {
  const { user_id, from, to } = req.query;
  let query = 'SELECT * FROM attendance WHERE 1=1';
  const params = [];
  if (user_id) { params.push(user_id); query += ` AND user_id = $${params.length}`; }
  if (from) { params.push(from); query += ` AND at >= $${params.length}`; }
  if (to) { params.push(to); query += ` AND at <= $${params.length}`; }
  query += ' ORDER BY at DESC LIMIT 500';
  const { rows } = await pool.query(query, params);
  res.json(rows);
});

app.post('/api/attendance/clock-in', auth, async (req, res) => {
  const { user_id, note } = req.body;
  await pool.query('INSERT INTO attendance (user_id, type, note, source) VALUES ($1, $2, $3, $4)',
    [user_id || req.user.id, 'clock_in', note, 'manual']);
  res.json({ ok: true });
});

app.post('/api/attendance/clock-out', auth, async (req, res) => {
  const { user_id, note } = req.body;
  await pool.query('INSERT INTO attendance (user_id, type, note, source) VALUES ($1, $2, $3, $4)',
    [user_id || req.user.id, 'clock_out', note, 'manual']);
  res.json({ ok: true });
});

// ============ LEAVES ============
app.get('/api/leaves', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM leaves ORDER BY requested_at DESC LIMIT 200');
  res.json(rows);
});

app.post('/api/leaves', auth, async (req, res) => {
  const l = req.body;
  const { rows } = await pool.query(
    `INSERT INTO leaves (user_id, type, start_date, end_date, start_time, end_time, reason, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
    [l.user_id || req.user.id, l.type, l.start_date, l.end_date, l.start_time, l.end_time, l.reason]
  );
  res.json({ id: rows[0].id });
});

app.put('/api/leaves/:id/approve', auth, requireRole('admin', 'manager'), async (req, res) => {
  await pool.query(`UPDATE leaves SET status = 'approved', reviewed_by = $2, reviewed_at = NOW(), review_note = $3 WHERE id = $1`,
    [req.params.id, req.user.name, req.body.note]);
  res.json({ ok: true });
});

app.put('/api/leaves/:id/reject', auth, requireRole('admin', 'manager'), async (req, res) => {
  await pool.query(`UPDATE leaves SET status = 'rejected', reviewed_by = $2, reviewed_at = NOW(), review_note = $3 WHERE id = $1`,
    [req.params.id, req.user.name, req.body.note]);
  res.json({ ok: true });
});

// ============ COMPANY PROFILE ============
app.get('/api/company', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM company_profile WHERE id = 1');
  res.json(rows[0] || {});
});

app.put('/api/company', auth, requireRole('admin'), async (req, res) => {
  const c = req.body;
  await pool.query(
    `UPDATE company_profile SET name=$1, name_en=$2, industry=$3, address=$4, phone=$5, email=$6, website=$7, ceo=$8, established=$9, employee_count=$10, factories=$11, description=$12, updated_at=NOW() WHERE id=1`,
    [c.name, c.name_en, c.industry, c.address, c.phone, c.email, c.website, c.ceo, c.established, c.employee_count, c.factories, c.description]
  );
  res.json({ ok: true });
});

// ============ NOTIFICATIONS ============
app.get('/api/notifications', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM notifications WHERE user_id = $1 OR user_id IS NULL ORDER BY created_at DESC LIMIT 100', [req.user.id]);
  res.json(rows);
});

app.put('/api/notifications/:id/read', auth, async (req, res) => {
  await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

// ============ AUDIT LOG ============
app.get('/api/audit', auth, requireRole('admin', 'manager'), async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 500');
  res.json(rows);
});

// ============ SERVICE REQUESTS ============
app.get('/api/service-requests', auth, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM service_requests ORDER BY created_at DESC LIMIT 200');
  res.json(rows);
});

app.post('/api/service-requests', auth, async (req, res) => {
  const s = req.body;
  const { rows } = await pool.query(
    `INSERT INTO service_requests (receipt_number, action_type, service_type_v, equipment_name, equipment_code, equipment_id, install_location, fault_date_time, fault_description, additional_info, caused_stop, urgency, requesting_unit, requested_by, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
    [s.receipt_number, s.action_type, s.service_type, s.equipment_name, s.equipment_code, s.equipment_id, s.install_location, s.fault_date_time, s.fault_description, s.additional_info, s.caused_stop, s.urgency, s.requesting_unit, s.requested_by, s.status || 'pending']
  );
  res.json({ id: rows[0].id });
});

// ============ GENERIC ERROR HANDLER ============
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error', message: err.message });
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

// ============ START ============
app.listen(PORT, () => {
  console.log(`\n🚀 Baspar CMMS Backend running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM — shutting down...');
  pool.end().then(() => process.exit(0));
});
