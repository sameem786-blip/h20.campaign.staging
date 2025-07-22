import React from "react";

export function LabeledInput({
  icon,
  label,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex-1 bg-[#FFA87D] rounded-xl p-6">
      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <input
        {...props}
        className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      />
    </div>
  );
}

export function LabeledTextarea({
  icon,
  label,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="bg-[#f7f8fa] rounded-xl p-6 mb-4">
      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <textarea
        {...props}
        className="w-full border rounded-lg px-4 py-2 text-base mt-1"
      />
    </div>
  );
}

export function LabeledTag({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="w-full bg-[#FFA87D] rounded-xl p-6 mb-4">
      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className="text-lg bg-[#FFA87D] font-semibold">
        {value || <span className="text-gray-400 italic">Tap to add…</span>}
      </div>
    </div>
  );
}
