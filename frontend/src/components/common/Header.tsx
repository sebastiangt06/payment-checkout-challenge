// src/components/common/Header.tsx
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-[375px] sm:max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            W
          </div>
          <span className="font-bold text-slate-800 text-base tracking-tight">
            Store
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
          Sandbox
        </span>
      </div>
    </header>
  );
};