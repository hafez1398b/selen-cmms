"use client";

import { useAppState } from "@/context/AppStateContext";
import { AssetForm } from "@/components/forms/AssetForm";
import { WorkOrderForm } from "@/components/forms/WorkOrderForm";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { FailureForm } from "@/components/forms/FailureForm";
import { PersonnelForm } from "@/components/forms/PersonnelForm";
import { SparePartForm } from "@/components/forms/SparePartForm";
import { X } from "lucide-react";

export function ModalContainer() {
  const { modalOpen, setModalOpen, modalType, setModalType } = useAppState();
  if (!modalOpen) return null;

  const getTitle = () => {
    const titles: Record<string, string> = {
      addAsset: "افزودن تجهیز جدید", editAsset: "ویرایش تجهیز",
      addWorkOrder: "ایجاد دستور کار جدید", editWorkOrder: "ویرایش دستور کار",
      addMaintenance: "ایجاد برنامه PM جدید", editMaintenance: "ویرایش برنامه PM",
      addFailure: "ثبت خرابی جدید", editFailure: "ویرایش خرابی",
      addPersonnel: "افزودن پرسنل جدید", editPersonnel: "ویرایش پرسنل",
      addSparePart: "افزودن قطعه یدکی", editSparePart: "ویرایش قطعه یدکی",
    };
    return titles[modalType] || "";
  };

  const renderForm = () => {
    switch (modalType) {
      case "addAsset": case "editAsset": return <AssetForm />;
      case "addWorkOrder": case "editWorkOrder": return <WorkOrderForm />;
      case "addMaintenance": case "editMaintenance": return <MaintenanceForm />;
      case "addFailure": case "editFailure": return <FailureForm />;
      case "addPersonnel": case "editPersonnel": return <PersonnelForm />;
      case "addSparePart": case "editSparePart": return <SparePartForm />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center md:p-4" onClick={() => { setModalOpen(false); setModalType(""); }}>
      <div className="absolute inset-0 bg-black/60 md:bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full md:max-w-[600px] max-h-[95vh] md:max-h-[85vh] overflow-y-auto md:rounded-2xl rounded-t-2xl animate-fade-in bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
        </div>
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 dark:border-[#1a1a1a]">
          <h3 className="text-base md:text-lg font-bold text-amber-600 dark:text-amber-500">{getTitle()}</h3>
          <button onClick={() => { setModalOpen(false); setModalType(""); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 md:p-5">{renderForm()}</div>
      </div>
    </div>
  );
}
