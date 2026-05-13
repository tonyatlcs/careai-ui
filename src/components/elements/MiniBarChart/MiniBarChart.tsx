import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
} from "chart.js";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./MiniBarChart.module.scss";

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

const CHART_COLORS = [
  "#B4D4FA",
  "#8BB4F2",
  "#6A94E8",
  "#5746D9",
  "#B4D4FA",
] as const;

type MiniBarChartProps = {
  className?: string;
};

export function MiniBarChart({ className }: MiniBarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["", "", "", "", ""],
        datasets: [
          {
            data: [40, 65, 30, 100, 55],
            backgroundColor: [...CHART_COLORS],
            borderRadius: {
              topLeft: 6,
              topRight: 6,
              bottomLeft: 0,
              bottomRight: 0,
            },
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        datasets: {
          bar: {
            categoryPercentage: 1,
            barPercentage: 1,
          },
        },
        scales: {
          x: {
            display: false,
            grid: { display: false },
            border: { display: false },
          },
          y: {
            display: false,
            beginAtZero: true,
            max: 100,
            grid: { display: false },
            border: { display: false },
          },
        },
        layout: { padding: { top: 4, left: 2, right: 2, bottom: 0 } },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  return (
    <div className={cn(styles.root, className)}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
