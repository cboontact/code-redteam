import { CleanStatus } from "@/lib/types";
import { CLEAN_STATUS_CONFIG } from "@/lib/clean-status";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface StatusBadgeProps {
  status: CleanStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = CLEAN_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.badge,
        className
      )}
    >
      <FontAwesomeIcon icon={config.icon} className={config.iconColor} />
      {config.label}
    </span>
  );
}