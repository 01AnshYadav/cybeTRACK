"use client";

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  className,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}) {
  const classes = `
    w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors
    ${disabled ? "bg-gray-100/30 cursor-not-allowed" : ""}
    ${className || ""}
  `;

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
    />
  );
}

export function Textarea({
  placeholder,
  value,
  onChange,
  disabled,
  className,
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  className?: string;
}) {
  const classes = `
    w-full rounded border border-gray-600 px-4 py-3 text-dark-fg focus:outline-none focus:border-indigo-500 transition-colors resize-none
    ${disabled ? "bg-gray-100/30 cursor-not-allowed" : ""}
    ${className || ""}
  `;

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
    />
  );
}