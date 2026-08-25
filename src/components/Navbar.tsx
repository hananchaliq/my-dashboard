"use client";

import React, { useState } from "react";
import { Edit3, Grid, Bell, Plus } from "lucide-react";

interface NavbarProps {
   onOpenSettings: () => void;
}

export default function Navbar({ onOpenSettings }: NavbarProps) {
   const [activeTab, setActiveTab] = useState("Home");

   const tabs = ["Home", "Dev & Code", "Work", "Daily", "News & Reading", "Entertainment", "Shopping", "Learning", "Workspace"];

   return (
      <header className="flex items-center justify-between pb-3 border-b border-slate-800/60">
         {/* Greeting Left */}
         <div className="flex items-center space-x-2">
            <h1 className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
               Selamat Malam, Hanan <span className="text-amber-400">👋</span>
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">| Selasa, 26 Agustus 2025</span>
         </div>

         {/* Nav Tabs Center */}
         <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 scrollbar-none">
            {tabs.map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3.5 py-1 rounded-full text-xs transition-colors whitespace-nowrap ${activeTab === tab ? "bg-[#34d399] text-slate-950 font-bold shadow-md shadow-emerald-500/10" : "bg-[#0f131a]/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200"}`}>
                  {tab}
               </button>
            ))}
            <button onClick={onOpenSettings} className="p-1 rounded-full bg-[#0f131a] border border-slate-800 text-slate-400 hover:text-white transition-transform active:scale-95" title="Tambah Tab Workspace">
               <Plus className="w-3.5 h-3.5" />
            </button>
         </div>

         {/* Profile & Quick Icons Right */}
         <div className="flex items-center space-x-2">
            <button onClick={onOpenSettings} className="p-1.5 rounded-full bg-[#0f131a] border border-slate-800 text-slate-400 hover:text-white transition-colors">
               <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onOpenSettings} className="p-1.5 rounded-full bg-[#0f131a] border border-slate-800 text-slate-400 hover:text-white transition-colors">
               <Grid className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-full bg-[#0f131a] border border-slate-800 text-slate-400 hover:text-white transition-colors">
               <Bell className="w-3.5 h-3.5" />
            </button>
            <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md">H</div>
         </div>
      </header>
   );
}
