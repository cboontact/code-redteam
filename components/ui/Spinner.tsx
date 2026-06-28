import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full border-red-200 border-t-red-600 animate-spin",
        sizes[size],
        className
      )}
      role="status"
      aria-label="กำลังโหลด"
    />
  );
}