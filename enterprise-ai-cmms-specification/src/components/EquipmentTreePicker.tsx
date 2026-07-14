import { useState, useMemo } from 'react';
import { useApp } from '../lib/store';
import { I } from './Icon';
import { uid } from '../lib/utils';
import type { Equipment } from '../lib/types';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  allowCreate?: boolean;
}

export function EquipmentTreePicker({ selectedId, onSelect, allowCreate = true }: Props) {
  const { equipment, addEquipment } = useApp();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(equipment.filter(e => e.parentId === null).map(e => e.id))
  );
  const [search, setSearch] = useState('');
  const [creatingUnder, setCreatingUnder] = useState<string | null | 'root'>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('دپارتمان');

  const childrenOf = (pid: string | null) =>
    equipment.filter(e => e.parentId === pid)
      .filter(e => !search || e.name.includes(search) || e.code.includes(search));

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpanded(next);
  };

  const createNode = () => {
    if (!newName.trim()) return;
    const parentId = creatingUnder === 'root' ? null : creatingUnder;
    const newEq: Equipment = {
      id: uid('eq'),
      parentId,
      code: `${newCategory.slice(0, 3).toUpperCase()}-${equipment.length + 1}`,
      name: newName.trim(),
      category: newCategory,
      department: parentId ? equipment.find(e => e.id === parentId)?.department ?? 'تولید' : 'تولید',
      location: 'سالن اصلی',
      manufacturer: '-',
      model: '-',
      serial: '-',
      year: new Date().getFullYear(),
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchaseCost: 0,
      status: 'active',
      criticality: 'medium',
      healthScore: 90,
      rulDays: 720,
    };
    addEquipment(newEq);
    onSelect(newEq.id);
    if (parentId) setExpanded(prev => new Set([...prev, parentId]));
    setCreatingUnder(null);
    setNewName('');
  };

  // Build breadcrumb path for selected
  const selectedPath = useMemo(() => {
    if (!selectedId) return [];
    const path: Equipment[] = [];
    let current = equipment.find(e => e.id === selectedId);
    while (current) {
      path.unshift(current);
      current = current.parentId ? equipment.find(e => e.id === current!.parentId) : undefined;
    }
    return path;
  }, [selectedId, equipment]);

  const renderNode = (eq: Equipment, depth = 0) => {
    const kids = childrenOf(eq.id);
    const isExp = expanded.has(eq.id);
    const isSel = selectedId === eq.id;
    const isCategory = ['کارخانه', 'دپارتمان', 'خط تولید'].includes(eq.category);

    return (
      <div key={eq.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition group ${
            isSel ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/50' : 'hover:bg-amber-500/5 text-ink-200'
          }`}
          style={{ paddingRight: 8 + depth * 16 }}
          onClick={() => onSelect(eq.id)}
        >
          {kids.length > 0 ? (
            <button onClick={(e) => { e.stopPropagation(); toggle(eq.id); }} className="p-0.5 hover:bg-amber-500/10 rounded shrink-0">
              <I.ChevronDown size={14} className={`transition ${isExp ? '' : '-rotate-90'}`} />
            </button>
          ) : <span className="w-5 shrink-0" />}

          <span className={`shrink-0 ${isCategory ? 'text-amber-300' : 'text-ink-400'}`}>
            {isCategory ? <I.Folder size={14} /> : <I.Cpu size={14} />}
          </span>

          <span className="text-sm flex-1 truncate">{eq.name}</span>
          <span className="text-[10px] text-ink-400 font-mono shrink-0">{eq.code}</span>

          {allowCreate && (
            <button onClick={(e) => { e.stopPropagation(); setCreatingUnder(eq.id); setNewCategory('ماشین'); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-500/10 rounded text-amber-300 shrink-0" title="افزودن زیرمجموعه">
              <I.Plus size={11} />
            </button>
          )}
        </div>

        {/* Inline create form */}
        {creatingUnder === eq.id && (
          <div className="mr-8 my-1 p-2 surface-soft rounded-lg space-y-2">
            <div className="flex gap-2">
              <input autoFocus className="input-dark py-1.5 text-xs flex-1"
                placeholder="نام تجهیز جدید..."
                value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createNode(); if (e.key === 'Escape') setCreatingUnder(null); }} />
              <select className="input-dark py-1.5 text-xs w-32"
                value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                <option>دپارتمان</option>
                <option>خط تولید</option>
                <option>ماشین</option>
                <option>زیرمجموعه</option>
                <option>قطعه</option>
              </select>
            </div>
            <div className="flex gap-1 justify-end">
              <button onClick={() => setCreatingUnder(null)} className="px-2 py-1 rounded text-[11px] text-ink-300 hover:bg-amber-500/10">انصراف</button>
              <button onClick={createNode} className="btn-gold px-3 py-1 rounded text-[11px]">ساخت</button>
            </div>
          </div>
        )}

        {isExp && kids.map(k => renderNode(k, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Selected path breadcrumb */}
      {selectedPath.length > 0 && (
        <div className="surface ring-gold rounded-xl p-3">
          <div className="text-[10px] text-amber-300/80 mb-1.5">📍 محل انتخاب‌شده:</div>
          <div className="flex items-center gap-1 flex-wrap text-sm">
            {selectedPath.map((eq, i) => (
              <span key={eq.id} className="flex items-center gap-1">
                {i > 0 && <I.Chevron size={10} className="text-amber-400/60" />}
                <span className={`px-2 py-0.5 rounded ${i === selectedPath.length - 1 ? 'btn-gold' : 'bg-amber-500/10 text-amber-200'}`}>
                  {eq.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {!selectedId && (
        <div className="surface-soft rounded-xl p-3 text-xs text-amber-300 flex items-center gap-2">
          <I.Alert size={14} />
          محل قرارگیری تجهیزات در درختچه را انتخاب کنید (یا «بدون والد» را برای ساخت در ریشه انتخاب کنید).
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <I.Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-300/70" size={14} />
          <input className="input-dark pr-8 py-2 text-sm" placeholder="جستجو در درختچه..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => onSelect(null)}
          className={`px-3 py-2 rounded-lg text-xs ${selectedId === null ? 'btn-gold' : 'btn-ghost-gold'}`}>
          ریشه (بدون والد)
        </button>
        {allowCreate && (
          <button onClick={() => { setCreatingUnder('root'); setNewCategory('کارخانه'); }}
            className="btn-ghost-gold px-3 py-2 rounded-lg text-xs flex items-center gap-1" title="ایجاد گره ریشه جدید">
            <I.Plus size={12} /> گره جدید
          </button>
        )}
      </div>

      {creatingUnder === 'root' && (
        <div className="p-2 surface-soft rounded-lg space-y-2">
          <div className="flex gap-2">
            <input autoFocus className="input-dark py-1.5 text-xs flex-1"
              placeholder="نام گره ریشه جدید..." value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') createNode(); if (e.key === 'Escape') setCreatingUnder(null); }} />
            <select className="input-dark py-1.5 text-xs w-32" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
              <option>کارخانه</option>
              <option>سایت</option>
              <option>دپارتمان</option>
            </select>
          </div>
          <div className="flex gap-1 justify-end">
            <button onClick={() => setCreatingUnder(null)} className="px-2 py-1 rounded text-[11px] text-ink-300">انصراف</button>
            <button onClick={createNode} className="btn-gold px-3 py-1 rounded text-[11px]">ساخت</button>
          </div>
        </div>
      )}

      <div className="surface-soft rounded-xl p-2 max-h-[300px] overflow-y-auto">
        {childrenOf(null).length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-400">
            درختچه خالی است — روی «گره جدید» کلیک کنید تا ساختار را شروع کنید.
          </div>
        ) : (
          childrenOf(null).map(eq => renderNode(eq))
        )}
      </div>
    </div>
  );
}
