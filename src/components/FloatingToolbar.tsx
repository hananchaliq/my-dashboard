"use client";

import React from "react";
import { Search, Image as ImageIcon, Sliders, Layers } from "lucide-react";

interface FloatingToolbarProps {
  onOpenSettings: () => void;
}

export default function FloatingToolbar({ onOpenSettings }: FloatingToolbarProps) {
  const handleFocusSearch = () => {
    const input = document.getElementById("main-search-input") as HTMLInputElement;
    if (input) input.focus();
  };

  return (
    <div className="fixed right-4 bottom-6 flex flex-col space-y-2.5 z-40">
      <button
        onClick={handleFocusSearch}
        className="p-2.5 rounded-full bg-[#0d1017]/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        title="Fokus Pencarian"
      >
        <Search className="w-4 h-4" />
      </button>
      <button
        onClick={onOpenSettings}
        className="p-2.5 rounded-full bg-[#0d1017]/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        title="Pengaturan Wallpaper"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={onOpenSettings}
        className="p-2.5 rounded-full bg-[#0d1017]/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        title="Pengaturan Dashboard"
      >
        <Sliders className="w-4 h-4" />
      </button>
      <button
        onClick={onOpenSettings}
        className="p-2.5 rounded-full bg-[#0d1017]/90 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        title="Kelola Layout Workspace"
      >
        <Layers className="w-4 h-4" />
      </button>
    </div>
  );
}