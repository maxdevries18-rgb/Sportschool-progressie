"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProgressDataPoint {
  date: string;
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
}

interface ProgressChartProps {
  progressData: ProgressDataPoint[];
  isDark: boolean;
}

export default function ProgressChart({ progressData, isDark }: ProgressChartProps) {
  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const axisColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary-500").trim() || "#6366f1";

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={progressData}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateLabel}
          tick={{ fontSize: 12, fill: axisColor }}
          stroke={axisColor}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: axisColor }}
          stroke={axisColor}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: axisColor }}
          stroke={axisColor}
        />
        <Tooltip
          labelFormatter={(label) => {
            const d = new Date(label);
            return d.toLocaleDateString("nl-NL", {
              weekday: "short",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          }}
          contentStyle={{
            borderRadius: "8px",
            border: `1px solid ${tooltipBorder}`,
            backgroundColor: tooltipBg,
            color: isDark ? "#f3f4f6" : "#111827",
          }}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="maxWeight"
          name="Max Gewicht (kg)"
          stroke={primaryColor}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="maxReps"
          name="Max Reps"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="totalVolume"
          name="Totaal Volume"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
