import React from 'react';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomInput({ value, onChange }: CustomInputProps) {
  return (
    <div className="px-4 pb-4 pt-2">
      <h2 className="text-base font-semibold mb-2 text-purple-300">Custom Input</h2>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter your input here..."
          className="w-full h-24 px-4 py-3 bg-gray-800/60 text-sm text-white rounded-xl border border-purple-900/40 backdrop-blur-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 resize-none transition-all"
        />
      </div>
    </div>
  );
}
