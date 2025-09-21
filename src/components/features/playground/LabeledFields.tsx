import React from "react";

export function LabeledInput({
    icon,
    label,
    required = false,
    ...props
  }: {
    icon: React.ReactNode;
    label: string;
    required?: boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex-1 bg-[#FFA87D] rounded-xl p-6">
      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <input {...props} className="w-full border rounded-lg px-4 py-2 text-base mt-1" />
    </div>
  );
}

export function LabeledTextarea({
    icon,
    label,
    required = false,
    ...props
  }: {
    icon: React.ReactNode;
    label: string;
    required?: boolean;
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
      <div className="bg-[#FFA87D] rounded-xl p-6 mb-4">
        <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
          {icon}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <textarea {...props} className="w-full border rounded-lg px-4 py-2 text-base mt-1" />
      </div>
    );
  }

export function LabeledTag({
    icon,
    label,
    value,
    required = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    required?: boolean;
  }) {
  return (
    <div className="w-full bg-[#FFA87D] rounded-xl p-6 mb-4">
      <div className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <div className="text-lg text-gray-900 font-semibold">
        {value || <span className="text-gray-400 italic">Tap to add...</span>}
      </div>
    </div>
  );
} 