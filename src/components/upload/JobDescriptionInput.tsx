'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({ value, onChange, disabled }: JobDescriptionInputProps) {
  const [open, setOpen] = useState(value.length > 0);

  const update = (index: number, text: string) => {
    const next = [...value];
    next[index] = text;
    onChange(next);
  };

  const add = () => {
    onChange([...value, '']);
    setOpen(true);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  if (!open && value.length === 0) {
    return (
      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        <Plus className="w-4 h-4" />
        Add a target job description
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Job Descriptions <span className="text-gray-400">(optional, helps tailor keywords)</span>
        </label>
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> Add another
        </button>
      </div>

      {value.map((jd, i) => (
        <div key={i} className="relative">
          <textarea
            value={jd}
            onChange={(e) => update(i, e.target.value)}
            disabled={disabled}
            rows={4}
            placeholder={`Job description ${i + 1}…`}
            className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
