"use client";

import { useState } from "react";
import { WizardForm, OptionCards, InputField, TextareaField, type WizardStep } from "@/components/ui/WizardForm";
import { SmartSelectList } from "@/components/ui/SmartSelectList";
import { assetsTreeData } from "@/lib/assets-data";
import { personnelData } from "@/lib/personnel-data";
import { CheckCircle2, User, Wrench, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useWorkOrders } from "@/context/WorkOrdersContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkOrderWizard({ isOpen, onClose }: Props) {
  const toast = useToast();
  const { addWorkOrder } = useWorkOrders();

  const steps: WizardStep[] = [
    {
      id: "type",
      title: "نوع دستور کار چیست؟",
      subtitle: "دسته‌بندی کار مورد نظر",
      icon: "🔧",
      validate: (d) => !d.type ? "لطفاً نوع را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.type}
          onChange={(v: any) => setData({ type: v })}
          options={[
            { value: "preventive", label: "پیشگیرانه (PM)", icon: "🔧", color: "#22c55e", description: "نگهداری برنامه‌ریزی شده" },
            { value: "corrective", label: "اصلاحی (CM)", icon: "🛠️", color: "#f59e0b", description: "رفع خرابی" },
            { value: "predictive", label: "پیش‌بینانه (PdM)", icon: "🔮", color: "#8b5cf6", description: "بر اساس پایش" },
            { value: "emergency", label: "اضطراری", icon: "🚨", color: "#ef4444", description: "خرابی بحرانی" },
          ]}
        />
      ),
    },
    {
      id: "equipment",
      title: "تجهیز مورد نظر",
      subtitle: "کدام تجهیز نیاز به کار دارد؟",
      icon: "⚙️",
      validate: (d) => !d.equipmentId ? "لطفاً تجهیز را انتخاب کنید" : null,
      getSummary: (d) => d.equipmentName ? `${d.equipmentName}${d.equipmentCode ? " (" + d.equipmentCode + ")" : ""}` : "-",
      render: ({ data, setData }) => (
        <div className="space-y-3">
          <SmartSelectList
            options={assetsTreeData.filter(a => a.typeKey === "equipment").map(a => ({
              value: String(a.id),
              label: a.name,
              description: `${a.code} • ${a.manufacturer || ""}`,
              icon: "⚙️",
            }))}
            value={data.equipmentId ? String(data.equipmentId) : ""}
            onChange={(v, label) => {
              if (!v) return;
              const asset = assetsTreeData.find(a => String(a.id) === v);
              if (asset) {
                setData({ equipmentId: asset.id, equipmentName: asset.name, equipmentCode: asset.code });
              } else {
                setData({ equipmentId: Date.now(), equipmentName: label, equipmentCode: `TEMP-${Date.now()}` });
              }
            }}
            storageKey="wo_equipment"
            columns={2}
            addLabel="افزودن تجهیز جدید"
          />
          {data.equipmentName && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>تجهیز انتخاب شده: <strong className="text-green-600 dark:text-green-500">{data.equipmentName}</strong> ({data.equipmentCode})</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "title",
      title: "عنوان دستور کار",
      subtitle: "توضیح مختصر کار",
      icon: "📝",
      validate: (d) => !d.title ? "عنوان الزامی است" : null,
      render: ({ data, setData }) => (
        <InputField
          value={data.title || ""}
          onChange={v => setData({ title: v })}
          placeholder="مثال: تعویض بلبرینگ اصلی موتور"
        />
      ),
    },
    {
      id: "priority",
      title: "اولویت اجرا",
      subtitle: "میزان فوریت کار",
      icon: "⚠️",
      validate: (d) => !d.priority ? "لطفاً اولویت را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <OptionCards
          columns={2}
          value={data.priority}
          onChange={(v: any) => setData({ priority: v })}
          options={[
            { value: "low", label: "کم", icon: "🟢", color: "#22c55e" },
            { value: "medium", label: "متوسط", icon: "🔵", color: "#3b82f6" },
            { value: "high", label: "بالا", icon: "🟠", color: "#f59e0b" },
            { value: "critical", label: "بحرانی", icon: "🔴", color: "#ef4444" },
          ]}
        />
      ),
    },
    {
      id: "assignedTo",
      title: "تخصیص به کدام تکنسین؟",
      subtitle: "مسئول اصلی اجرا",
      icon: "👤",
      validate: (d) => !d.assignedTo ? "لطفاً مسئول را انتخاب کنید" : null,
      render: ({ data, setData }) => (
        <SmartSelectList
          options={personnelData.filter(p => ["technician", "expert", "supervisor"].includes(p.role)).map(p => ({
            value: p.fullName,
            label: p.fullName,
            description: `${p.position} • بهره‌وری: ${p.productivity}%`,
            icon: "👤",
          }))}
          value={data.assignedTo}
          onChange={(v) => setData({ assignedTo: v })}
          storageKey="wo_assigned"
          columns={2}
          addLabel="افزودن تکنسین/پیمانکار جدید"
        />
      ),
    },
    {
      id: "schedule",
      title: "زمان‌بندی اجرا",
      subtitle: "تاریخ و زمان تخمینی",
      icon: "📅",
      validate: (d) => !d.scheduledDate ? "تاریخ الزامی است" : null,
      render: ({ data, setData }) => (
        <div className="space-y-3">
          <InputField
            label="تاریخ برنامه‌ریزی شده"
            value={data.scheduledDate || ""}
            onChange={v => setData({ scheduledDate: v })}
            placeholder="۱۴۰۴/۱۲/۲۸"
            dir="ltr"
          />
          <InputField
            label="زمان تخمینی (ساعت)"
            type="number"
            value={data.estimatedHours || ""}
            onChange={v => setData({ estimatedHours: Number(v) })}
            placeholder="4"
          />
        </div>
      ),
    },
    {
      id: "description",
      title: "توضیحات اجرا",
      subtitle: "شرح کار و نکات مهم",
      icon: "📄",
      render: ({ data, setData }) => (
        <TextareaField
          value={data.description || ""}
          onChange={v => setData({ description: v })}
          placeholder="جزئیات کار، ابزار مورد نیاز، نکات ایمنی..."
          rows={5}
        />
      ),
    },
  ];

  return (
    <WizardForm
      isOpen={isOpen}
      onClose={onClose}
      title="ایجاد دستور کار جدید"
      subtitle="فرآیند گام به گام"
      gradient="from-blue-500 to-amber-500"
      steps={steps}
      initialData={{ priority: "medium", type: "preventive" }}
      completionMessage="دستور کار با موفقیت صادر شد!"
      onComplete={(data) => {
        // Actually save the work order to global state
        const wo = addWorkOrder({
          title: data.title,
          description: data.description,
          assetName: data.equipmentName || "-",
          assetId: data.equipmentId,
          priority: data.priority,
          type: data.type,
          status: "open",
          assignedTo: data.assignedTo,
          scheduledDate: data.scheduledDate,
          estimatedHours: String(data.estimatedHours || 0),
        });
        toast.success("دستور کار صادر شد", `${wo.orderNumber} به ${wo.assignedTo} تخصیص یافت`);
      }}
    />
  );
}
