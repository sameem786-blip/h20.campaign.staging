import React from "react";

type BuilderCardProps = {
  icon: React.ReactNode;
  title: string;
  editCard: string | null;
  cardKey: string;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;      // View mode content
  editContent: React.ReactNode;   // Edit mode content
};

export default function BuilderCard({
  icon,
  title,
  editCard,
  cardKey,
  onEdit,
  onCancel,
  onSave,
  children,
  editContent,
}: BuilderCardProps) {
  const isEditing = editCard === cardKey;

  return (
    <div
      className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 cursor-pointer"
      onClick={() => !isEditing && onEdit()}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${title.toLowerCase()} section`}
    >
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <span className="font-bold text-xl">{title}</span>
        {isEditing && (
          <div className="ml-auto flex gap-2">
            <button
              className="px-5 py-2 rounded-lg border border-gray-300 text-black bg-white font-medium cursor-pointer flex items-center gap-1"
              type="button"
              onClick={e => { e.stopPropagation(); onCancel(); }}
            >
              <span className="text-lg">✕</span> Cancel
            </button>
            <button
              className="px-5 py-2 rounded-lg bg-black text-white flex items-center gap-2 font-medium cursor-pointer"
              type="button"
              onClick={e => { e.stopPropagation(); onSave(); }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        )}
      </div>
      <div className="rounded-xl p-6">
        {isEditing ? editContent : children}
      </div>
    </div>
  );
} 