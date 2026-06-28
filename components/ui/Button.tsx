"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: ReactNode;
}

export function Button({
  children,
  loading,
  variant = "primary",
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-200",
    secondary:
      "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200",
    danger: "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-600",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}