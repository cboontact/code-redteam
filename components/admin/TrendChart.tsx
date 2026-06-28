"use client";

interface TrendChartProps {
  data: { date: string; submitted: number; total: number }[];
}

export function TrendChart({ data }: TrendChartProps) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-800 mb-4">แนวโน้มการส่งรายงาน</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((d) => {
          const pct = (d.submitted / maxVal) * 100;
          const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString(
            "th-TH",
            { day: "numeric", month: "short" }
          );
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-xs text-gray-500">
                {d.submitted}/{d.total}
              </span>
              <div className="w-full bg-gray-100 rounded-t-lg relative h-28">
                <div
                  className="absolute bottom-0 w-full bg-red-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{dateLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}