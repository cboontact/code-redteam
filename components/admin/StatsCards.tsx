import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faClock,
  faBroom,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  totalRooms: number;
  submitted: number;
  notSubmitted: number;
  clean: number;
  partial: number;
  needsAttention: number;
}

export function StatsCards({
  totalRooms,
  submitted,
  notSubmitted,
  clean,
  partial,
  needsAttention,
}: StatsCardsProps) {
  const cards = [
    {
      label: "ส่งแล้ว",
      value: submitted,
      sub: `จาก ${totalRooms} ห้อง`,
      icon: faCheckCircle,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      countColor: "text-emerald-700",
      labelColor: "text-emerald-600",
    },
    {
      label: "ยังไม่ส่ง",
      value: notSubmitted,
      sub: "รอรายงาน",
      icon: faClock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      countColor: "text-amber-700",
      labelColor: "text-amber-600",
    },
    {
      label: "สะอาดดี",
      value: clean,
      sub: "รายงานวันนี้",
      icon: faBroom,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      countColor: "text-sky-700",
      labelColor: "text-sky-600",
    },
    {
      label: "ต้องปรับปรุง",
      value: needsAttention,
      sub: `พอใช้: ${partial}`,
      icon: faTriangleExclamation,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      countColor: "text-red-700",
      labelColor: "text-red-600",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex items-center justify-center rounded-xl border border-gray-100 bg-white px-2.5 py-2.5 min-h-[4.5rem]"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-9 h-9 shrink-0 rounded-lg flex items-center justify-center",
                  card.iconBg
                )}
              >
                <FontAwesomeIcon
                  icon={card.icon}
                  className={cn(card.iconColor, "text-sm")}
                />
              </div>
              <div className="text-center leading-tight min-w-0">
                <span
                  className={cn(
                    "block text-xl font-bold tabular-nums leading-none",
                    card.countColor
                  )}
                >
                  {card.value}
                </span>
                <span
                  className={cn(
                    "block text-xs font-semibold mt-0.5",
                    card.labelColor
                  )}
                >
                  {card.label}
                </span>
                <span className="block text-[10px] text-gray-400 mt-0.5 truncate">
                  {card.sub}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}