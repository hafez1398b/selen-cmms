// Mock maintenance history generator — creates realistic past PM/repair records for all equipment
// Starting from 1405/01/01 (Iranian new year)
import type { Equipment, WorkOrder, User } from './types';
import { generatePMPlan, FREQUENCY_LABEL, type PMFrequency } from './pmGenerator';
import { uid } from './utils';

const START_DATE = new Date(2026, 2, 21); // 1405/01/01 ≈ 2026-03-21 Gregorian
const FREQ_DAYS: Record<PMFrequency, number> = {
  daily: 1, weekly: 7, monthly: 30, quarterly: 90, semiannual: 180, annual: 365,
};

/** Pick a status for a historical work order based on its date relative to today */
function pickStatus(woDate: Date, now: Date): { status: WorkOrder['status']; hasActual: boolean } {
  const daysAgo = (now.getTime() - woDate.getTime()) / 86400000;
  if (daysAgo < 0) return { status: 'draft', hasActual: false }; // future
  if (daysAgo < 1) return { status: 'in_progress', hasActual: true };
  if (daysAgo < 3) {
    // Recent: 60% in progress, 20% verification, 20% completed
    const r = Math.random();
    if (r < 0.6) return { status: 'in_progress', hasActual: true };
    if (r < 0.8) return { status: 'verification', hasActual: true };
    return { status: 'completed', hasActual: true };
  }
  // Old: 90% completed, 5% closed, 5% overdue (in_progress)
  const r = Math.random();
  if (r < 0.05) return { status: 'in_progress', hasActual: false }; // overdue
  if (r < 0.95) return { status: 'completed', hasActual: true };
  return { status: 'closed', hasActual: true };
}

/** Random duration in hours based on task minutes */
function randomDuration(planMinutes: number): number {
  // Actual is usually 0.7x-1.3x planned
  return Math.round((planMinutes / 60) * (0.7 + Math.random() * 0.6) * 10) / 10;
}

/** Generate full historical work orders for all equipment from START_DATE to now */
export function generateMockHistory(
  equipment: Equipment[],
  users: User[],
  options: { skipExisting?: WorkOrder[] } = {}
): WorkOrder[] {
  const now = new Date();
  const existing = options.skipExisting ?? [];
  const out: WorkOrder[] = [];
  let woCounter = 1000 + existing.length;

  const technicians = users.filter(u => u.role === 'technician' || u.role === 'supervisor');
  if (technicians.length === 0) {
    // fallback: any non-admin
    technicians.push(...users.filter(u => u.role !== 'admin').slice(0, 3));
  }

  const eqWithChildren = equipment.filter(e => {
    // Skip group/department/factory level nodes — only generate for actual equipment
    const isCategoryNode = ['کارخانه', 'دپارتمان', 'گروه صنعتی', 'خط تولید', 'سایت'].includes(e.category);
    return !isCategoryNode;
  });

  eqWithChildren.forEach((eq, eqIdx) => {
    const plan = generatePMPlan(eq);
    if (plan.tasks.length === 0) return;

    plan.tasks.forEach((task, taskIdx) => {
      const intervalDays = FREQ_DAYS[task.frequency];
      // For daily tasks, only generate every 7 days to avoid millions of records
      const effectiveInterval = task.frequency === 'daily' ? 7 : intervalDays;

      // Calculate number of occurrences from START_DATE to now + a few future
      const totalDays = (now.getTime() - START_DATE.getTime()) / 86400000;
      const occurrences = Math.floor(totalDays / effectiveInterval) + 1; // +1 future

      // Limit to last 12 occurrences to keep mock data reasonable
      const maxOccur = Math.min(occurrences, 12);

      for (let i = 0; i < maxOccur; i++) {
        const offsetDays = i * effectiveInterval;
        const woDate = new Date(START_DATE.getTime() + offsetDays * 86400000);
        if (woDate > new Date(now.getTime() + 30 * 86400000)) break; // not too far future

        const { status, hasActual } = pickStatus(woDate, now);
        const tech = technicians[(eqIdx + taskIdx + i) % technicians.length];
        const actualHours = hasActual ? randomDuration(task.duration) : task.duration / 60;
        const estCost = Math.round(task.duration / 60 * 800_000 + task.spareParts.length * 200_000);
        const actualCost = hasActual ? Math.round(estCost * (0.85 + Math.random() * 0.4)) : 0;

        woCounter++;
        const plannedStart = new Date(woDate);
        const plannedEnd = new Date(woDate.getTime() + task.duration * 60_000);
        const actualStart = hasActual ? new Date(woDate.getTime() + (Math.random() < 0.7 ? 0 : 3_600_000)) : undefined;
        const actualEnd = hasActual && status !== 'in_progress'
          ? new Date(actualStart!.getTime() + actualHours * 3_600_000) : undefined;

        // Type: 80% preventive, 15% corrective (from emergent need), 5% inspection
        const r = Math.random();
        const type: WorkOrder['type'] = r < 0.8 ? 'preventive' : r < 0.95 ? 'corrective' : 'inspection';

        // Priority based on equipment criticality + random
        const priority: WorkOrder['priority'] =
          eq.criticality === 'critical' ? (Math.random() < 0.6 ? 'high' : 'medium') :
            eq.criticality === 'high' ? 'medium' :
              Math.random() < 0.3 ? 'medium' : 'low';

        out.push({
          id: uid('wo'),
          number: `WO-${1405}-${String(woCounter).padStart(4, '0')}`,
          title: `${task.activity} — ${eq.name}`,
          description: `${type === 'preventive' ? 'برنامه نگهداری' : type === 'corrective' ? 'تعمیر اصلاحی' : 'بازرسی'} ${FREQUENCY_LABEL[task.frequency]} طبق دستورالعمل سازنده. معیار پذیرش: ${task.acceptanceCriteria}`,
          type, priority, status,
          equipmentId: eq.id,
          department: eq.department,
          requestedBy: tech.id,
          assignedTo: [tech.id],
          plannedStart: plannedStart.toISOString(),
          plannedEnd: plannedEnd.toISOString(),
          actualStart: actualStart?.toISOString(),
          actualEnd: actualEnd?.toISOString(),
          estimatedCost: estCost,
          actualCost,
          laborHours: actualHours,
          partsUsed: task.spareParts.length > 0
            ? [{ partId: `mock_part_${taskIdx}`, qty: 1 + Math.floor(Math.random() * 2) }]
            : [],
          attachmentsBefore: [],
          attachmentsAfter: [],
          voiceNotes: [],
          textNotes: status === 'completed' || status === 'closed' ? [{
            author: tech.name,
            text: `✓ ${task.activity} با موفقیت انجام شد. نتیجه: ${task.acceptanceCriteria}`,
            at: actualEnd?.toISOString() ?? plannedEnd.toISOString(),
          }] : [],
          viewedAt: hasActual ? [{ userId: tech.id, at: actualStart!.toISOString() }] : [],
          createdAt: new Date(woDate.getTime() - 86400000).toISOString(),
          updatedAt: (actualEnd ?? plannedEnd).toISOString(),
        });
      }
    });
  });

  return out;
}

/** Filter to only the most relevant historical records (limit to avoid bloat) */
export function condenseHistory(history: WorkOrder[], maxPerEquipment = 30): WorkOrder[] {
  const byEq = new Map<string, WorkOrder[]>();
  for (const wo of history) {
    const eqId = wo.equipmentId ?? 'none';
    if (!byEq.has(eqId)) byEq.set(eqId, []);
    byEq.get(eqId)!.push(wo);
  }
  const out: WorkOrder[] = [];
  byEq.forEach(list => {
    // Sort by date, keep most recent N
    list.sort((a, b) => new Date(b.plannedStart).getTime() - new Date(a.plannedStart).getTime());
    out.push(...list.slice(0, maxPerEquipment));
  });
  return out;
}
