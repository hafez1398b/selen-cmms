"use client";

import type { AssetNode } from "@/lib/assets-data";
import { X, Printer, Download } from "lucide-react";

interface Props {
  asset: AssetNode;
  isOpen: boolean;
  onClose: () => void;
}

// Simple QR-like visual (in production use qrcode library)
function QRPattern({ text }: { text: string }) {
  // Deterministic pattern based on text
  const hash = text.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid: boolean[][] = [];
  for (let i = 0; i < 21; i++) {
    grid[i] = [];
    for (let j = 0; j < 21; j++) {
      const seed = (i * 31 + j * 17 + hash) % 100;
      grid[i][j] = seed < 45;
    }
  }
  // Position markers (top-left, top-right, bottom-left)
  const markPos = (sx: number, sy: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const inner = i > 1 && i < 5 && j > 1 && j < 5;
        const outer = i === 0 || i === 6 || j === 0 || j === 6;
        grid[sy + i][sx + j] = outer || inner;
      }
    }
  };
  markPos(0, 0);
  markPos(14, 0);
  markPos(0, 14);

  return (
    <div className="grid grid-cols-21 gap-0 w-52 h-52 bg-white p-2 rounded-lg" style={{ gridTemplateColumns: "repeat(21, 1fr)" }}>
      {grid.flat().map((cell, i) => (
        <div key={i} className={cell ? "bg-black" : "bg-white"} />
      ))}
    </div>
  );
}

export function AssetQRCode({ asset, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const qrData = `SELEN-CMMS|${asset.code}|${asset.id}`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-[#111] rounded-2xl p-6 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 left-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a]">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-2">کد QR تجهیز</h3>
          <p className="text-xs text-gray-500 mb-4">برای اسکن با موبایل و دسترسی سریع</p>

          <div className="flex justify-center mb-4">
            <QRPattern text={qrData} />
          </div>

          <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">کد:</p>
            <p className="font-mono font-bold text-amber-500" dir="ltr">{asset.code}</p>
            <p className="text-xs text-gray-500 mt-2 mb-1">نام:</p>
            <p className="font-bold text-sm">{asset.name}</p>
          </div>

          <div className="flex gap-2">
            <button className="btn-secondary flex-1 justify-center">
              <Printer className="w-3.5 h-3.5" />
              چاپ
            </button>
            <button className="btn-primary flex-1 justify-center">
              <Download className="w-3.5 h-3.5" />
              دانلود
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
