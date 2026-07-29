"use client";

import type { AssetNode } from "@/lib/assets-data";
import { assetTypes } from "@/lib/assets-data";
import { Building2, Calendar, MapPin, Package, Tag, Hash, User, Wrench } from "lucide-react";

interface Props {
  asset: AssetNode;
}

export function IdentityTab({ asset }: Props) {
  const typeInfo = assetTypes[asset.typeKey];

  const fields = [
    { icon: Hash, label: "کد تجهیز", value: asset.code, mono: true },
    { icon: Package, label: "نام تجهیز", value: asset.name },
    { icon: Tag, label: "نام انگلیسی", value: asset.nameEn || "-" },
    { icon: Building2, label: "سازنده", value: asset.manufacturer || "-" },
    { icon: Wrench, label: "مدل", value: asset.model || "-", mono: true },
    { icon: Hash, label: "شماره سریال", value: asset.serialNumber || "-", mono: true },
    { icon: Calendar, label: "سال ساخت", value: asset.yearManufactured?.toString() || "-" },
    { icon: Calendar, label: "سال نصب", value: asset.yearInstalled?.toString() || "-" },
    { icon: MapPin, label: "موقعیت", value: asset.location || "-" },
    { icon: User, label: "نوع", value: typeInfo.label },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main Info */}
      <div className="chart-card">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-amber-500 rounded-full" />
          اطلاعات کلی
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((field, i) => {
            const Icon = field.icon;
            return (
              <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#1a1a1a]">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] text-gray-500">{field.label}</span>
                </div>
                <p className={`text-sm font-medium ${field.mono ? 'font-mono' : ''}`} dir={field.mono ? 'ltr' : 'auto'}>
                  {field.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specifications */}
      {asset.specifications && Object.keys(asset.specifications).length > 0 && (
        <div className="chart-card">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" />
            مشخصات فنی
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(asset.specifications).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-[10px] text-gray-500">{key}</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="chart-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">وضعیت</p>
          <p className={`text-sm font-black ${
            asset.status === 'active' ? 'text-green-500' :
            asset.status === 'maintenance' ? 'text-amber-500' :
            asset.status === 'failed' ? 'text-red-500' : 'text-gray-500'
          }`}>
            {asset.status === 'active' ? 'فعال' :
             asset.status === 'maintenance' ? 'در تعمیر' :
             asset.status === 'failed' ? 'خراب' : 'غیرفعال'}
          </p>
        </div>
        <div className="chart-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">بحرانیت</p>
          <p className={`text-sm font-black ${
            asset.criticality === 'critical' ? 'text-red-500' :
            asset.criticality === 'high' ? 'text-amber-500' :
            asset.criticality === 'medium' ? 'text-blue-500' : 'text-green-500'
          }`}>
            {asset.criticality === 'critical' ? 'بحرانی' :
             asset.criticality === 'high' ? 'بالا' :
             asset.criticality === 'medium' ? 'متوسط' : 'پایین'}
          </p>
        </div>
        <div className="chart-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">سلامت</p>
          <p className="text-sm font-black text-amber-500">{asset.healthScore}%</p>
        </div>
        <div className="chart-card !p-3 text-center">
          <p className="text-[10px] text-gray-500 mb-1">دسترس‌پذیری</p>
          <p className="text-sm font-black text-green-500">{asset.availability || 0}%</p>
        </div>
      </div>
    </div>
  );
}
