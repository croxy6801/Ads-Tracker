"use client";

import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#C6C6CD] rounded-[4px]">
      <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-[4px] bg-[#EFF4FF] text-[#0F172A]">
        {icon || <FolderOpen className="w-6 h-6 text-[#76777D]" />}
      </div>
      <h3 className="font-headline text-[20px] font-medium text-[#0B1C30] mb-1">
        {title}
      </h3>
      <p className="font-sans text-[14px] text-[#45464D] max-w-sm mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 font-sans text-[14px] font-semibold text-white bg-[#0F172A] hover:bg-[#131B2E] rounded-[4px] shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
