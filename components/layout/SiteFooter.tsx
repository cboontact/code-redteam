import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import {
  SiNextdotjs,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "react-icons/si";
import { cn } from "@/lib/utils";

const TECH_STACK = [
  {
    Icon: SiNextdotjs,
    title: "Next.js 16",
    label: "Next.js",
    lightClass: "text-gray-900",
    darkClass: "text-white",
  },
  {
    Icon: SiTypescript,
    title: "TypeScript",
    label: "TypeScript",
    lightClass: "text-[#3178C6]",
    darkClass: "text-[#3178C6]",
  },
  {
    Icon: SiSupabase,
    title: "Supabase Database & Storage",
    label: "Supabase",
    lightClass: "text-[#3FCF8E]",
    darkClass: "text-[#3FCF8E]",
  },
  {
    Icon: SiTailwindcss,
    title: "Tailwind CSS",
    label: "Tailwind CSS",
    lightClass: "text-[#06B6D4]",
    darkClass: "text-[#06B6D4]",
  },
  {
    Icon: SiVercel,
    title: "Vercel",
    label: "Vercel",
    lightClass: "text-gray-900",
    darkClass: "text-white",
  },
] as const;

interface SiteFooterProps {
  variant?: "light" | "dark";
  className?: string;
}

export function SiteFooter({ variant = "light", className }: SiteFooterProps) {
  const isLight = variant === "light";

  return (
    <footer
      className={cn(
        "shrink-0 border-t px-4 py-5 sm:px-6",
        isLight
          ? "border-gray-100 bg-white"
          : "border-white/10 bg-gray-900",
        className
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
        <span
          className={cn(
            "inline-flex items-center gap-2 text-sm font-medium",
            isLight ? "text-slate-700" : "text-white/90"
          )}
          title="Developer"
        >
          <FontAwesomeIcon
            icon={faCode}
            className={cn("text-xs", isLight ? "text-sky-500" : "text-sky-200")}
          />
          Chonnatee Boonta
        </span>

        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm",
            isLight ? "text-slate-500" : "text-white/80"
          )}
        >
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-xs",
                isLight ? "text-slate-400" : "text-white/60"
              )}
              aria-hidden
            >
              ©
            </span>
            2569 สงวนลิขสิทธิ์
          </span>

          <span
            className={cn(
              "hidden h-3 w-px sm:block",
              isLight ? "bg-slate-200" : "bg-white/20"
            )}
            aria-hidden
          />

          <span className="inline-flex flex-wrap items-center justify-center gap-2.5">
            <span
              className={cn(
                "text-xs font-medium",
                isLight ? "text-slate-500" : "text-white/70"
              )}
            >
              Powered by
            </span>
            <span className="inline-flex items-center gap-2.5">
              {TECH_STACK.map(({ Icon, title, label, lightClass, darkClass }) => (
                <span
                  key={label}
                  title={title}
                  aria-label={label}
                  className={cn(
                    "inline-flex transition-opacity hover:opacity-80",
                    isLight ? lightClass : darkClass
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
              ))}
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}