-- =====================================================
-- 📜 Mock Maintenance History (سوابق آزمایشی)
-- =====================================================
-- تولید سوابق دستور کار برای همه تجهیزات از 1405/01/01 تا امروز
-- برای هر تجهیز، بر اساس نوع PM آن، دستور کار ایجاد می‌شود
-- =====================================================

BEGIN;

-- Helper: generate WOs based on frequency for a set of equipment codes
-- We use PL/pgSQL for programmatic generation

DO $$
DECLARE
  eq_record RECORD;
  wo_date TIMESTAMPTZ;
  today TIMESTAMPTZ := NOW();
  start_date TIMESTAMPTZ := '2026-03-21 08:00:00+03'::TIMESTAMPTZ; -- 1405/01/01
  interval_days INTEGER;
  wo_status wo_status;
  wo_type_v wo_type;
  wo_priority_v wo_priority;
  actual_hrs NUMERIC;
  tech_id UUID;
  tech_ids UUID[] := ARRAY[
    '44444444-4444-4444-4444-444444444444'::UUID,
    '55555555-5555-5555-5555-555555555555'::UUID,
    '66666666-6666-6666-6666-666666666666'::UUID
  ];
  wo_counter INTEGER := 1000;
  new_wo_id UUID;
  days_ago NUMERIC;
BEGIN
  -- For each non-category equipment, generate WOs based on its type
  FOR eq_record IN
    SELECT id, code, name, category, department, criticality
    FROM equipment
    WHERE category NOT IN ('کارخانه', 'دپارتمان', 'گروه صنعتی', 'سایت', 'خط تولید')
  LOOP
    -- Determine interval based on equipment type
    IF eq_record.name ILIKE '%کانوایر%' OR eq_record.name ILIKE '%کولر%' THEN
      interval_days := 30; -- monthly PM
    ELSIF eq_record.name ILIKE '%کمپرسور%' OR eq_record.name ILIKE '%چیلر%' THEN
      interval_days := 21; -- ~ 3 weekly
    ELSIF eq_record.name ILIKE '%ژنراتور%' OR eq_record.name ILIKE '%دیگ%' THEN
      interval_days := 45;
    ELSIF eq_record.name ILIKE '%تزریق%' OR eq_record.name ILIKE '%Hennecke%' THEN
      interval_days := 30;
    ELSIF eq_record.name ILIKE '%برش%' THEN
      interval_days := 30;
    ELSIF eq_record.category = 'تجهیز آزمایشگاهی' THEN
      interval_days := 60;
    ELSIF eq_record.name ILIKE '%آتش%' THEN
      interval_days := 30;
    ELSIF eq_record.name ILIKE '%درب%' OR eq_record.name ILIKE '%لیفتراک%' THEN
      interval_days := 60;
    ELSE
      interval_days := 45;
    END IF;

    -- Generate WOs from start_date to today
    wo_date := start_date;
    WHILE wo_date < today + INTERVAL '30 days' LOOP
      days_ago := EXTRACT(EPOCH FROM (today - wo_date)) / 86400;

      -- Determine status based on age
      IF days_ago < 0 THEN
        wo_status := 'draft';
      ELSIF days_ago < 1 THEN
        wo_status := 'in_progress';
      ELSIF days_ago < 3 THEN
        wo_status := (ARRAY['in_progress', 'verification', 'completed']::wo_status[])[1 + floor(random() * 3)::INTEGER];
      ELSE
        -- Old records: mostly completed
        wo_status := CASE
          WHEN random() < 0.05 THEN 'in_progress'::wo_status -- overdue
          WHEN random() < 0.95 THEN 'completed'::wo_status
          ELSE 'closed'::wo_status
        END;
      END IF;

      -- Type: 80% preventive, 15% corrective, 5% inspection
      wo_type_v := CASE
        WHEN random() < 0.80 THEN 'preventive'::wo_type
        WHEN random() < 0.95 THEN 'corrective'::wo_type
        ELSE 'inspection'::wo_type
      END;

      -- Priority based on criticality
      wo_priority_v := CASE
        WHEN eq_record.criticality = 'critical' AND random() < 0.6 THEN 'high'::wo_priority
        WHEN eq_record.criticality = 'critical' THEN 'medium'::wo_priority
        WHEN eq_record.criticality = 'high' THEN 'medium'::wo_priority
        WHEN random() < 0.3 THEN 'medium'::wo_priority
        ELSE 'low'::wo_priority
      END;

      -- Random duration (2-8 hours)
      actual_hrs := ROUND((2 + random() * 6)::NUMERIC, 1);

      -- Random tech
      tech_id := tech_ids[1 + floor(random() * 3)::INTEGER];

      wo_counter := wo_counter + 1;
      new_wo_id := uuid_generate_v4();

      -- Insert work order
      INSERT INTO work_orders (
        id, number, title, description, type, priority, status,
        equipment_id, department, requested_by,
        planned_start, planned_end, actual_start, actual_end,
        estimated_cost, actual_cost, labor_hours,
        created_at, updated_at
      ) VALUES (
        new_wo_id,
        'WO-1405-' || LPAD(wo_counter::TEXT, 4, '0'),
        CASE wo_type_v
          WHEN 'preventive' THEN 'PM ' ||
            CASE
              WHEN interval_days <= 30 THEN 'ماهانه '
              WHEN interval_days <= 60 THEN 'دوماهه '
              ELSE 'دوره‌ای '
            END || eq_record.name
          WHEN 'corrective' THEN 'تعمیر ' || eq_record.name
          ELSE 'بازرسی ' || eq_record.name
        END,
        'بر اساس برنامه نگهداری و استانداردهای صنعتی',
        wo_type_v,
        wo_priority_v,
        wo_status,
        eq_record.id,
        eq_record.department,
        '22222222-2222-2222-2222-222222222222',
        wo_date,
        wo_date + INTERVAL '4 hours',
        CASE WHEN wo_status NOT IN ('draft') THEN wo_date + (random() * INTERVAL '2 hours') ELSE NULL END,
        CASE WHEN wo_status IN ('completed', 'closed') THEN wo_date + (actual_hrs * INTERVAL '1 hour') ELSE NULL END,
        (2000000 + floor(random() * 8000000))::NUMERIC,
        CASE WHEN wo_status IN ('completed', 'closed') THEN (1800000 + floor(random() * 10000000))::NUMERIC ELSE 0 END,
        actual_hrs,
        wo_date - INTERVAL '1 day',
        COALESCE(wo_date + (actual_hrs * INTERVAL '1 hour'), wo_date)
      );

      -- Assign the tech
      INSERT INTO wo_assignments (wo_id, user_id) VALUES (new_wo_id, tech_id);

      -- Add completion note for completed WOs
      IF wo_status IN ('completed', 'closed') THEN
        INSERT INTO wo_text_notes (wo_id, author, text, created_at) VALUES (
          new_wo_id,
          (SELECT name FROM users WHERE id = tech_id),
          '✓ فعالیت با موفقیت انجام شد. تجهیز آماده بهره‌برداری.',
          COALESCE(wo_date + (actual_hrs * INTERVAL '1 hour'), wo_date)
        );
        -- Mark as viewed
        INSERT INTO wo_views (wo_id, user_id, viewed_at)
        VALUES (new_wo_id, tech_id, wo_date)
        ON CONFLICT DO NOTHING;
      END IF;

      -- Move to next occurrence
      wo_date := wo_date + (interval_days || ' days')::INTERVAL;

      -- Safety: limit to 25 WOs per equipment
      IF wo_counter > 5000 THEN EXIT; END IF;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- Mock Attendance Records (last 30 days)
-- =====================================================
DO $$
DECLARE
  u_record RECORD;
  d DATE;
  in_ts TIMESTAMPTZ;
  out_ts TIMESTAMPTZ;
BEGIN
  FOR d IN SELECT generate_series(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day', '1 day'::INTERVAL)::DATE LOOP
    -- Skip Fridays (day of week 5 in ISO, 6 in JS getDay)
    IF EXTRACT(DOW FROM d) = 5 THEN CONTINUE; END IF;

    FOR u_record IN SELECT id FROM users WHERE active = TRUE LOOP
      -- 12% chance of absence
      IF random() < 0.12 THEN CONTINUE; END IF;

      in_ts := d + (INTERVAL '7 hours' + (random() * INTERVAL '90 minutes'));
      out_ts := d + (INTERVAL '16 hours' + (random() * INTERVAL '2 hours'));

      INSERT INTO attendance (user_id, type, at, source)
      VALUES (u_record.id, 'clock_in', in_ts, 'auto');

      INSERT INTO attendance (user_id, type, at, source)
      VALUES (u_record.id, 'clock_out', out_ts, 'auto');
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- Sample Leave Requests
-- =====================================================
INSERT INTO leaves (user_id, type, start_date, end_date, reason, status, requested_at, reviewed_by, reviewed_at)
SELECT
  u.id,
  (ARRAY['استحقاقی', 'استعلاجی', 'مأموریت']::leave_type[])[1 + floor(random() * 3)::INTEGER],
  CURRENT_DATE + ((random() * 60 - 30)::INTEGER || ' days')::INTERVAL,
  CURRENT_DATE + ((random() * 60 - 30 + random() * 4)::INTEGER || ' days')::INTERVAL,
  (ARRAY['مرخصی شخصی', 'مراجعه به پزشک', 'مأموریت بازرسی', 'تعطیلات خانوادگی', 'استراحت'])[1 + floor(random() * 5)::INTEGER],
  (ARRAY['pending', 'approved', 'approved']::leave_status[])[1 + floor(random() * 3)::INTEGER],
  NOW() - (random() * INTERVAL '20 days'),
  'مهندس کریمی',
  NOW() - (random() * INTERVAL '15 days')
FROM users u WHERE u.active = TRUE
LIMIT 10;

COMMIT;

-- Summary
SELECT 'Mock history loaded!' AS status,
       (SELECT COUNT(*) FROM work_orders) AS wo_count,
       (SELECT COUNT(*) FROM attendance) AS attendance_count,
       (SELECT COUNT(*) FROM leaves) AS leaves_count;
