import React from 'react';
import { cn } from '../../lib/utils';

interface ChartSwitcherProps {
  options: string[];
  selected: string;
  onChange: (option: string) => void;
}

export function ChartSwitcher({ options, selected, onChange }: ChartSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "text-xs font-semibold px-3 py-1.5 rounded-full transition-all",
            selected === option
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
