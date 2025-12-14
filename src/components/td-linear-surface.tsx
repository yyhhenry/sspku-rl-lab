import { useIsDark } from "@/lib/theme";
import * as echarts from "echarts";
import ReactECharts from "echarts-for-react";
import "echarts-gl";
import { useMemo } from "react";

export type TDLinearSurfaceProps = {
  values: number[][];
  height?: number;
};

export function TDLinearSurface({
  values,
  height = 420,
}: TDLinearSurfaceProps) {
  const isDark = useIsDark();
  const option = useMemo(() => {
    const rows = values.length;
    const cols = values[0]?.length ?? 0;

    const textColor = isDark ? "rgb(200, 200, 200)" : "rgb(50, 50, 50)";
    const tooltipBackgroundColor = isDark
      ? "rgba(15, 23, 42, 0.7)"
      : "rgba(250, 250, 250, 0.7)";

    const data: Array<[number, number, number]> = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        // Use 1-based coordinates and swap axis orientation to match row/col expectation.
        data.push([r + 1, c + 1, values[r]?.[c] ?? 0]);
      }
    }

    const zValues = data.map(point => point[2]);
    const zMin = zValues.length ? Math.min(...zValues) : 0;
    const zMax = zValues.length ? Math.max(...zValues) : 0;

    return {
      tooltip: {
        backgroundColor: tooltipBackgroundColor,
        borderColor: textColor,
        borderWidth: 1,
        textStyle: { color: textColor },
      },
      visualMap: {
        min: zMin,
        max: zMax,
        calculable: true,
        orient: "vertical",
        left: "left",
        top: "middle",
        inRange: {
          color: ["#2c7bb6", "#ffffbf", "#d7191c"],
        },
        textStyle: { color: textColor },
      },
      xAxis3D: {
        type: "value",
        name: "row",
        min: 1,
        max: rows,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
      },
      yAxis3D: {
        type: "value",
        name: "col",
        min: 1,
        max: cols,
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor },
        axisLine: { lineStyle: { color: textColor } },
      },
      zAxis3D: {
        type: "value",
        name: "V(s)",
        nameTextStyle: { color: textColor },
        axisLabel: { color: textColor, margin: 14 },
        axisLine: { lineStyle: { color: textColor } },
      },
      grid3D: {
        boxHeight: 80,
        viewControl: { projection: "perspective" },
      },
      series: [
        {
          type: "surface",
          data,
          shading: "realistic",
          wireframe: { show: false },
        },
      ],
    };
  }, [isDark, values]);

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ width: "100%", height }}
      notMerge
      lazyUpdate
    />
  );
}
