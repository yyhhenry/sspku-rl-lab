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
  const option = useMemo(() => {
    const rows = values.length;
    const cols = values[0]?.length ?? 0;

    const data: Array<[number, number, number]> = [];
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        data.push([c, rows - 1 - r, values[r]?.[c] ?? 0]);
      }
    }

    const zValues = data.map(point => point[2]);
    const zMin = zValues.length ? Math.min(...zValues) : 0;
    const zMax = zValues.length ? Math.max(...zValues) : 0;

    return {
      tooltip: {},
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
      },
      xAxis3D: { type: "value", name: "col" },
      yAxis3D: { type: "value", name: "row" },
      zAxis3D: { type: "value", name: "V(s)" },
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
  }, [values]);

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
