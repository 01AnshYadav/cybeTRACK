"use client";

import { ReactNode } from "react";

export function Card({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
}) {
  const classes = `
    bg-gray-800/50 rounded-lg p-6
    transition-shadow hover:bg-gray-800/70
    ${className || ""}
  `;

  return (
    <div className={classes} {...props}>
      <div className="prose prose-invert dark:prose-invert">{children}</div>
    </div>
  );
}