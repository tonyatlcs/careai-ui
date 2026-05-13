import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  type ChartOptions,
  type Plugin,
  LinearScale,
} from "chart.js";
import { ChevronDown, CloudUpload, Users } from "lucide-react";
import { useEffect, useId, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import styles from "./PatientOverviewWidget.module.scss";

Chart.register(BarController, BarElement, CategoryScale, LinearScale);

const LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"] as const;

const DATA_TOTAL_PATIENTS = [
  25_000, 30_000, 50_000, 25_000, 25_000, 45_000, 30_000,
];
const DATA_OUTPATIENT = [
  15_000, 20_000, 35_000, 15_000, 15_000, 30_000, 20_000,
];

const COLOR_PURPLE = "#7367F0";
const COLOR_LIGHT_STACK = "#E8EAF6";

const AXIS_GREY = "#9ca3af";

function formatYTick(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "";
  if (n === 0) return "0";
  const k = n / 1000;
  if (Number.isInteger(k)) return `${k}k`;
  return `${k.toFixed(0)}k`;
}

function verticalLinePlugin(
  pluginId: string,
  categoryIndex: number,
): Plugin<"bar"> {
  return {
    id: pluginId,
    afterDraw(chart) {
      const scale = chart.scales.x;
      const labelCount = chart.data.labels?.length ?? 0;
      if (categoryIndex < 0 || categoryIndex >= labelCount) return;

      const x = scale.getPixelForTick(categoryIndex);
      const { top, bottom } = chart.chartArea;
      const { ctx } = chart;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1;
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
      ctx.restore();
    },
  };
}

export type PatientOverviewWidgetProps = {
  className?: string;
  /** Zero-based index of the month column to draw the dashed highlight line through. */
  highlightMonthIndex?: number;
};

export function PatientOverviewWidget({
  className,
  highlightMonthIndex = 2,
}: PatientOverviewWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);
  const linePluginId = `patientOverviewVLine-${useId().replace(/:/g, "")}`;

  const linePlugin = useMemo(
    () => verticalLinePlugin(linePluginId, highlightMonthIndex),
    [linePluginId, highlightMonthIndex],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartRef.current?.destroy();

    const options: ChartOptions<"bar"> = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      datasets: {
        bar: {
          categoryPercentage: 0.55,
          barPercentage: 0.85,
          borderRadius: 0,
          borderSkipped: false,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false, drawTicks: false },
          border: { display: false },
          ticks: {
            color: AXIS_GREY,
            font: {
              size: 11,
              family: "Inter, ui-sans-serif, system-ui, sans-serif",
            },
            padding: 4,
          },
        },
        y: {
          stacked: true,
          min: 0,
          max: 90_000,
          grid: {
            color: "#e5e7eb",
            drawTicks: false,
            lineWidth: 1,
          },
          border: { display: false, dash: [5, 5], dashOffset: 0 },
          ticks: {
            color: AXIS_GREY,
            font: {
              size: 11,
              family: "Inter, ui-sans-serif, system-ui, sans-serif",
            },
            padding: 4,
            callback: (tickValue) => formatYTick(tickValue as number),
            stepSize: 20_000,
          },
        },
      },
      layout: { padding: { top: 0, right: 0, left: 0, bottom: 0 } },
    };

    chartRef.current = new Chart(ctx, {
      type: "bar",
      plugins: [linePlugin],
      data: {
        labels: [...LABELS],
        datasets: [
          {
            label: "Total patients",
            data: DATA_TOTAL_PATIENTS,
            backgroundColor: COLOR_PURPLE,
            stack: "care",
          },
          {
            label: "Avg. Outpatient care",
            data: DATA_OUTPATIENT,
            backgroundColor: COLOR_LIGHT_STACK,
            stack: "care",
          },
        ],
      },
      options,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [linePlugin]);

  return (
    <article className={cn(styles.root, className)}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <div className={styles.iconWrap} aria-hidden>
              <Users className={styles.titleIcon} strokeWidth={2} />
            </div>
            <h2 className={styles.title}>Patient overview</h2>
          </div>
          <div className={styles.legend} role="list">
            <span className={styles.legendItem} role="listitem">
              <span
                className={cn(styles.swatch, styles.swatchPatients)}
                aria-hidden
              />
              Total patients
            </span>
            <span className={styles.legendItem} role="listitem">
              <span
                className={cn(styles.swatch, styles.swatchOutpatient)}
                aria-hidden
              />
              Avg. Outpatient care
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.rangeButton}>
            Last 30 days
            <ChevronDown className={styles.rangeChevron} aria-hidden />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Upload"
          >
            <CloudUpload className={styles.uploadIcon} aria-hidden />
          </button>
        </div>
      </div>
      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
    </article>
  );
}
