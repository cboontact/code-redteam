import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChalkboardUser, faPhone } from "@fortawesome/free-solid-svg-icons";

interface AdvisorInfoProps {
  name?: string | null;
  phone?: string | null;
  compact?: boolean;
}

export function AdvisorInfo({ name, phone, compact }: AdvisorInfoProps) {
  if (!name && !phone) return null;

  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-1"
          : "mt-2 p-3 bg-sky-50 border border-sky-100 rounded-xl text-sm space-y-1"
      }
    >
      {name && (
        <span className="flex items-center gap-1.5">
          <FontAwesomeIcon
            icon={faChalkboardUser}
            className={compact ? "text-sky-400 text-[10px]" : "text-sky-500"}
          />
          <span className={compact ? "" : "text-sky-800 font-medium"}>
            ครูที่ปรึกษา: {name}
          </span>
        </span>
      )}
      {phone && (
        <span className="flex items-center gap-1.5">
          <FontAwesomeIcon
            icon={faPhone}
            className={compact ? "text-sky-400 text-[10px]" : "text-sky-500"}
          />
          <span className={compact ? "" : "text-sky-700"}>{phone}</span>
        </span>
      )}
    </div>
  );
}