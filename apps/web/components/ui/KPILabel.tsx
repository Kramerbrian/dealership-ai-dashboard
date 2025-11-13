'use client';
import { ReactNode } from 'react';

interface KPILabelProps {
  icon: ReactNode;
  label: string;
  info: string;
}

export function KPILabel({ icon, label, info }: KPILabelProps) {
  return (
    <span className="relative group inline-flex items-center gap-2">
      {icon}
      {label}
      <span className="opacity-70 text-xs px-1 rounded border border-slate-700 cursor-help">?</span>
      <div className="invisible group-hover:visible absolute z-10 left-0 top-6 w-64 text-xs bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-lg">
        {info}
      </div>
    </span>
  );
}
