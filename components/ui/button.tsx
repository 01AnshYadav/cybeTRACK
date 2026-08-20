"use client";

import { ReactNode } from "react";

export function Button({
  children,
  variant = "primary",
  disabled,
  className,
  onClick,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const variantClasses = variant === "primary"
    ? "bg-indigo-600 hover:bg-indigo-500"
    : variant === "secondary"
    ? "bg-gray-800 hover:bg-gray-600"
    : "border border-gray-600 hover:bg-gray-700 text-gray-200";

  const baseClasses = `
    rounded-full px-8 py-3 text-white font-medium transition-colors shadow-sm
    ${variantClasses}
    ${disabled ? "bg-gray-600 cursor-not-allowed" : ""}
    ${className || ""}
  `;

  return (
    <button
      className={baseClasses}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}