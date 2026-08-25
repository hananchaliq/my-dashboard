import React from "react";
import { Settings } from "@/types";

// 1. Tambahkan/sesuaikan interface props di sini
interface SettingsOverlayProps {
   settings: Settings;
   onSave: (newSettings: Settings) => void;
   onClose: () => void; // <-- Pastikan huruf 'C' besar
}

export default function SettingsOverlay({
   settings,
   onSave,
   onClose, // <-- Sesuaikan juga di sini
}: SettingsOverlayProps) {
   return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
         <div className="bg-[#0d1117] p-6 rounded-xl border border-slate-800 w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Settings</h2>

            {/* ... Konten Settings kamu ... */}

            <div className="flex justify-end gap-2 pt-4">
               <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition">
                  Close
               </button>
            </div>
         </div>
      </div>
   );
}
