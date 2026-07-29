"use client";

import { WizardForm, OptionCards, InputField, TextareaField, type WizardStep } from "@/components/ui/WizardForm";
import { SmartSelectList } from "@/components/ui/SmartSelectList";
import { assetTypes, assetCategories, type AssetTypeKey, type AssetNode, type CategoryKey, assetsTreeData } from "@/lib/assets-data";
import { Sparkles } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<AssetNode, "id" | "path" | "level">) => void;
  initialData?: Partial<AssetNode>;
  parentId?: number | null;
  mode: "add" | "edit";
}

export function AssetFormAdvanced({ isOpen, onClose, onSave, initialData, parentId, mode }: Props) {

  const steps: WizardStep[] = [
    // Step 1: Category (دسته‌بندی رسمی)
    {
      id: "category",
      title: "کدام دسته تجهیز؟",
      subtitle: "دسته اصلی تجهیز را انتخاب کنید",
      icon: "📂",
      validate: (data) => !data.category ? "لطفاً یک دسته انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={3}
          value={data.category}
          onChange={(v: any) => setData({ category: v })}
          options={(Object.entries(assetCategories) as [CategoryKey, typeof assetCategories[CategoryKey]][]).map(([k, c]) => ({
            value: k, label: c.label, icon: c.icon, color: c.color, description: c.description,
          }))}
        />
      ),
    },

    // Step 2: Type Key
    {
      id: "typeKey",
      title: "نوع تجهیز چیست؟",
      subtitle: "سطح تجهیز در سلسله مراتب",
      icon: "⚙️",
      validate: (data) => !data.typeKey ? "لطفاً نوع را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.typeKey}
          onChange={(v: any) => setData({ typeKey: v })}
          options={[
            { value: "equipment", label: "تجهیز", icon: "⚙️", description: "دستگاه اصلی مانند میکسر، پرس" },
            { value: "subsystem", label: "زیرسیستم", icon: "🔧", description: "بخشی از یک تجهیز (موتور، پمپ)" },
            { value: "part", label: "قطعه", icon: "🔩", description: "قطعه مانند بلبرینگ، فیلتر" },
            { value: "subpart", label: "زیرقطعه", icon: "🔗", description: "زیرقطعه کوچک‌تر" },
          ]}
        />
      ),
    },

    // Step 3: Parent
    {
      id: "parentId",
      title: "این تجهیز زیرمجموعه کدام است؟",
      subtitle: "والد را انتخاب کنید (یا بدون والد)",
      icon: "🌳",
      render: ({ data, setData }) => {
        const parents = assetsTreeData.filter(a =>
          data.typeKey === "equipment" ? a.typeKey === "category" :
          data.typeKey === "subsystem" ? a.typeKey === "equipment" :
          data.typeKey === "part" ? ["equipment", "subsystem"].includes(a.typeKey) :
          true
        );
        return (
          <div className="space-y-3">
            <button
              onClick={() => setData({ parentId: null })}
              className={`w-full p-3 rounded-xl border-2 text-right ${data.parentId === null ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-[#1a1a1a]'}`}
            >
              <p className="text-sm font-bold">بدون والد (ریشه)</p>
              <p className="text-[10px] text-gray-500">به‌عنوان ریشه در درخت قرار می‌گیرد</p>
            </button>
            <SmartSelectList
              options={parents.map(p => ({
                value: String(p.id),
                label: p.name,
                description: `${p.code} • ${assetTypes[p.typeKey].label}`,
                icon: assetTypes[p.typeKey].icon,
              }))}
              value={data.parentId !== null ? String(data.parentId) : ""}
              onChange={(v) => setData({ parentId: v ? Number(v) : null })}
              storageKey={`asset_parent_${data.typeKey}`}
              placeholder="جستجوی والد..."
              addLabel="افزودن والد جدید"
              customItemsEditable={false}
            />
          </div>
        );
      },
    },

    // Step 4: Basic Info
    {
      id: "basic",
      title: "اطلاعات پایه",
      subtitle: "کد و نام تجهیز",
      icon: "🏷️",
      validate: (data) => {
        if (!data.name) return "نام تجهیز الزامی است";
        if (!data.code) return "کد تجهیز الزامی است";
        return null;
      },
      render: ({ data, setData }) => (
        <div className="space-y-3">
          <InputField
            label="نام تجهیز *"
            value={data.name || ""}
            onChange={v => setData({ name: v })}
            placeholder="مثال: میکسر اصلی"
          />
          <InputField
            label="کد تجهیز *"
            value={data.code || ""}
            onChange={v => setData({ code: v })}
            placeholder="مثال: MX-101"
            dir="ltr"
          />
          <InputField
            label="نام انگلیسی (اختیاری)"
            value={data.nameEn || ""}
            onChange={v => setData({ nameEn: v })}
            placeholder="Main Mixer"
            dir="ltr"
          />
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 dark:text-gray-400">
              کد تجهیز باید یکتا باشد و طبق استاندارد سلن نوشته شود (مثال: <strong dir="ltr">MX-101</strong>)
            </p>
          </div>
        </div>
      ),
    },

    // Step 5: Manufacturer & Model
    {
      id: "specs",
      title: "مشخصات فنی",
      subtitle: "سازنده، مدل، سریال (اختیاری)",
      icon: "🏭",
      render: ({ data, setData }) => (
        <div className="space-y-3">
          <InputField label="سازنده" value={data.manufacturer || ""} onChange={v => setData({ manufacturer: v })} placeholder="مثال: Cannon، Siemens، ABB" />
          <InputField label="مدل" value={data.model || ""} onChange={v => setData({ model: v })} placeholder="A80" dir="ltr" />
          <InputField label="شماره سریال" value={data.serialNumber || ""} onChange={v => setData({ serialNumber: v })} placeholder="SN-2019-4521" dir="ltr" />
          <div className="grid grid-cols-2 gap-3">
            <InputField label="سال ساخت" value={data.yearManufactured || ""} onChange={v => setData({ yearManufactured: Number(v) || undefined })} type="number" placeholder="2019" />
            <InputField label="سال نصب" value={data.yearInstalled || ""} onChange={v => setData({ yearInstalled: Number(v) || undefined })} type="number" placeholder="1398" />
          </div>
          <InputField label="موقعیت / محل نصب" value={data.location || ""} onChange={v => setData({ location: v })} placeholder="سالن تولید، ردیف A" />
        </div>
      ),
    },

    // Step 6: Status
    {
      id: "status",
      title: "وضعیت فعلی",
      subtitle: "وضعیت عملیاتی تجهیز",
      icon: "🚦",
      validate: (data) => !data.status ? "لطفاً وضعیت را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.status}
          onChange={(v: any) => setData({ status: v })}
          options={[
            { value: "active", label: "فعال", icon: "✅", color: "#22c55e", description: "در حال کار عادی" },
            { value: "maintenance", label: "در تعمیر", icon: "🔧", color: "#f59e0b", description: "در حال نگهداری یا تعمیر" },
            { value: "inactive", label: "غیرفعال", icon: "⏸️", color: "#6b7280", description: "متوقف / خارج از سرویس" },
            { value: "failed", label: "خراب", icon: "❌", color: "#ef4444", description: "دچار خرابی" },
          ]}
        />
      ),
    },

    // Step 7: Criticality
    {
      id: "criticality",
      title: "درجه بحرانیت",
      subtitle: "چقدر برای تولید مهم است؟",
      icon: "⚠️",
      validate: (data) => !data.criticality ? "لطفاً بحرانیت را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.criticality}
          onChange={(v: any) => setData({ criticality: v })}
          options={[
            { value: "low", label: "کم", icon: "🟢", color: "#22c55e", description: "خرابی تاثیر کم دارد" },
            { value: "medium", label: "متوسط", icon: "🔵", color: "#3b82f6", description: "خرابی تاثیر متوسط" },
            { value: "high", label: "بالا", icon: "🟠", color: "#f59e0b", description: "خرابی تاثیر جدی" },
            { value: "critical", label: "بحرانی", icon: "🔴", color: "#ef4444", description: "خرابی توقف تولید" },
          ]}
        />
      ),
    },

    // Step 8: Health Score
    {
      id: "healthScore",
      title: "امتیاز سلامت فعلی",
      subtitle: "بین ۰ تا ۱۰۰ (پیش‌فرض ۱۰۰)",
      icon: "💚",
      render: ({ data, setData }) => (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-5xl font-black" style={{ color: (data.healthScore || 100) >= 85 ? '#22c55e' : (data.healthScore || 100) >= 70 ? '#f59e0b' : '#ef4444' }}>
              {data.healthScore || 100}%
            </p>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={data.healthScore || 100}
            onChange={e => setData({ healthScore: Number(e.target.value) })}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>🔴 خراب</span>
            <span>🟡 متوسط</span>
            <span>🟢 سالم</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[100, 85, 70].map(v => (
              <button key={v} onClick={() => setData({ healthScore: v })} className="p-2 rounded-lg border border-gray-200 dark:border-[#1a1a1a] text-xs">
                {v}%
              </button>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <WizardForm
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "افزودن تجهیز جدید" : "ویرایش تجهیز"}
      subtitle="فرآیند گام به گام با راهنمای هوشمند"
      gradient="from-amber-500 to-amber-700"
      steps={steps}
      initialData={initialData || { status: "active", criticality: "medium", healthScore: 100, parentId: parentId ?? null }}
      completionMessage={mode === "add" ? "تجهیز با موفقیت افزوده شد" : "تغییرات ذخیره شد"}
      onComplete={(data) => {
        onSave(data as Omit<AssetNode, "id" | "path" | "level">);
      }}
    />
  );
}
