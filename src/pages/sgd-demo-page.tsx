import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  constantAlphaFn,
  convergentSequenceAlphaFn,
  demoMiniBatchSGD,
  l2Dist,
  randomPoints,
  standardAlphaFn,
  type Point2D,
  type SGDIterInfo,
} from "@/lib/sgd-demo";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

const expectedValue: Point2D = { x: 0, y: 0 };
const sampleSize = 30;
const numSamples = 400;
const initialW: Point2D = { x: 50, y: 50 };

function AlphaFunctionComparison() {
  const iterations = 50;
  const [runKey, setRunKey] = useState(0);

  const [samples, setSamples] = useState<Point2D[]>([]);
  const [sampleMode, setSampleMode] = useState<"square" | "circle">("square");
  const [results, setResults] = useState<
    {
      name: string;
      iters: SGDIterInfo[];
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const newSamples = randomPoints(numSamples, sampleSize, sampleMode);
    setSamples(newSamples);

    const alphaConfigs = [
      {
        name: "$\\alpha_k = \\frac{1}{k}$",
        fn: standardAlphaFn(),
        color: "var(--chart-1)",
      },
      {
        name: "$\\alpha_k = 0.05$",
        fn: constantAlphaFn(0.05),
        color: "var(--chart-2)",
      },
      {
        name: "$\\alpha_k = \\frac{1+\\cos k}{2 k}$",
        fn: convergentSequenceAlphaFn(),
        color: "var(--chart-3)",
      },
    ];

    const newResults = alphaConfigs.map(({ name, fn, color }) => ({
      name,
      iters: demoMiniBatchSGD(newSamples, fn, iterations, initialW, 1),
      color,
    }));

    setResults(newResults);
  }, [sampleMode, runKey]);

  const trajectoryData = useMemo(() => {
    return results.map(({ name, iters, color }) => ({
      name,
      color,
      points: iters.map((iter, i) => ({
        x: iter.w.x,
        y: iter.w.y,
        iteration: i,
      })),
    }));
  }, [results]);

  const errorData = useMemo(() => {
    if (results.length === 0) return [];
    const maxLen = Math.max(...results.map(r => r.iters.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: { iteration: number; [key: string]: number } = {
        iteration: i,
      };
      results.forEach(({ name, iters }) => {
        if (i < iters.length) {
          point[name] = l2Dist(iters[i].w, expectedValue);
        }
      });
      return point;
    });
  }, [results]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: React.ReactNode; color: string }> =
      {};
    results.forEach(({ name, color }) => {
      config[name] = { label: <Markdown content={name} />, color };
    });
    return config;
  }, [results]);

  return (
    <div className="m-2">
      <div className="flex my-2 gap-2 items-center flex-wrap">
        <label className="m-2">Sample Mode:</label>
        {["square", "circle"].map(option => (
          <Button
            key={option}
            variant={option === sampleMode ? "default" : "link"}
            onClick={() => {
              if (option !== "square" && option !== "circle") return;
              setSampleMode(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>

      <div>
        <ChartContainer className="aspect-square" config={{}}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-sampleSize, sampleSize]}
              label={{ value: "X", position: "insideBottom", offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-sampleSize, sampleSize]}
              label={{ value: "Y", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter
              name="Samples"
              data={samples}
              fill="rgba(128, 128, 128, 0.3)"
              shape="circle"
            />
            <Scatter
              name="Expected E[X]"
              data={[expectedValue]}
              fill="red"
              shape="cross"
              legendType="cross"
            />
            {trajectoryData.map(({ name, points, color }) => (
              <Scatter
                key={name}
                name={name}
                data={points}
                fill={color}
                shape="circle"
                line
                lineType="joint"
              />
            ))}
          </ScatterChart>
        </ChartContainer>
        <ChartContainer config={chartConfig}>
          <LineChart data={errorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="iteration"
              label={{
                value: "Iteration",
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              label={{
                value: "Error ||w - E[X]||",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel={true} />} />
            <ChartLegend content={<ChartLegendContent />} />
            {results.map(({ name, color }) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

function BatchSizeComparison() {
  const iterations = 20;
  const [sampleMode, setSampleMode] = useState<"square" | "circle">("square");
  const [runKey, setRunKey] = useState(0);
  const [samples, setSamples] = useState<Point2D[]>([]);
  const [results, setResults] = useState<
    {
      name: string;
      batchSize: number;
      iters: SGDIterInfo[];
      color: string;
    }[]
  >([]);

  useEffect(() => {
    const newSamples = randomPoints(numSamples, sampleSize, sampleMode);
    setSamples(newSamples);

    const batchConfigs = [
      { name: "m = 1", batchSize: 1, color: "var(--chart-1)" },
      { name: "m = 10", batchSize: 10, color: "var(--chart-2)" },
      { name: "m = 50", batchSize: 50, color: "var(--chart-3)" },
      { name: "m = 100", batchSize: 100, color: "var(--chart-4)" },
    ];

    const alphaFn = standardAlphaFn();

    const newResults = batchConfigs.map(({ name, batchSize, color }) => ({
      name,
      batchSize,
      iters: demoMiniBatchSGD(
        newSamples,
        alphaFn,
        iterations,
        initialW,
        batchSize,
      ),
      color,
    }));

    setResults(newResults);
  }, [sampleMode, runKey]);

  const trajectoryData = useMemo(() => {
    return results.map(({ name, iters, color }) => ({
      name,
      color,
      points: iters.map((iter, i) => ({
        x: iter.w.x,
        y: iter.w.y,
        iteration: i,
      })),
    }));
  }, [results]);

  const errorData = useMemo(() => {
    if (results.length === 0) return [];
    const maxLen = Math.max(...results.map(r => r.iters.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: { iteration: number; [key: string]: number } = {
        iteration: i,
      };
      results.forEach(({ name, iters }) => {
        if (i < iters.length) {
          point[name] = l2Dist(iters[i].w, expectedValue);
        }
      });
      return point;
    });
  }, [results]);

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    results.forEach(({ name, color }) => {
      config[name] = { label: name, color };
    });
    return config;
  }, [results]);

  return (
    <div className="m-2">
      <div className="flex my-2 gap-2 items-center flex-wrap">
        <label className="m-2">Sample Mode:</label>
        {["square", "circle"].map(option => (
          <Button
            key={option}
            variant={option === sampleMode ? "default" : "link"}
            onClick={() => {
              if (option !== "square" && option !== "circle") return;
              setSampleMode(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>
      <div>
        <ChartContainer className="aspect-square" config={{}}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[-sampleSize, sampleSize]}
              label={{ value: "X", position: "insideBottom", offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={[-sampleSize, sampleSize]}
              label={{ value: "Y", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter
              name="Samples"
              data={samples}
              fill="rgba(128, 128, 128, 0.3)"
              shape="circle"
            />
            <Scatter
              name="Expected E[X]"
              data={[expectedValue]}
              fill="red"
              shape="cross"
              legendType="cross"
            />
            {trajectoryData.map(({ name, points, color }) => (
              <Scatter
                key={name}
                name={name}
                data={points}
                fill={color}
                shape="circle"
                line
                lineType="joint"
              />
            ))}
          </ScatterChart>
        </ChartContainer>

        <ChartContainer config={chartConfig} className="h-full">
          <LineChart data={errorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="iteration"
              label={{
                value: "Iteration",
                position: "insideBottom",
                offset: -10,
              }}
            />
            <YAxis
              label={{
                value: "Error ||w - E[X]||",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel={true} />} />
            <ChartLegend content={<ChartLegendContent />} />
            {results.map(({ name, color }) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
}

export function SGDDemoPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <Tabs defaultValue="alpha">
            <div className="overflow-x-auto">
              <TabsList className="w-fit min-w-full">
                <TabsTrigger value="alpha">
                  Alpha Function Comparison
                </TabsTrigger>
                <TabsTrigger value="batch">Batch Size Comparison</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="alpha">
              <AlphaFunctionComparison />
            </TabsContent>

            <TabsContent value="batch">
              <BatchSizeComparison />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
