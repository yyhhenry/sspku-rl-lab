import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  constantAlphaFn,
  convergentSequenceAlphaFn,
  l2Dist,
  miniBatchSGDDemo,
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

const EXPECTED_VALUE: Point2D = { x: 0, y: 0 };
const SQUARE_SIZE = 30;
const NUM_SAMPLES = 400;
const INITIAL_W: Point2D = { x: 50, y: 50 };

function AlphaFunctionComparison() {
  const iterations = 100;
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
    const newSamples = randomPoints(NUM_SAMPLES, SQUARE_SIZE, sampleMode);
    setSamples(newSamples);

    const alphaConfigs = [
      { name: "α = 1/k", fn: standardAlphaFn(), color: "var(--chart-1)" },
      {
        name: "α = 0.05",
        fn: constantAlphaFn(0.05),
        color: "var(--chart-2)",
      },
      {
        name: "α = (1+cos(k))/2/k",
        fn: convergentSequenceAlphaFn(),
        color: "var(--chart-3)",
      },
    ];

    const newResults = alphaConfigs.map(({ name, fn, color }) => ({
      name,
      iters: miniBatchSGDDemo(newSamples, fn, iterations, INITIAL_W, 1),
      color,
    }));

    setResults(newResults);
  }, [iterations, sampleMode, runKey]);

  const [activeIter, setActiveIter] = useState(0);

  useEffect(() => {
    setActiveIter(Math.min(activeIter, iterations));
  }, [iterations, activeIter]);

  const trajectoryData = useMemo(() => {
    return results.map(({ name, iters, color }) => ({
      name,
      color,
      points: iters.slice(0, activeIter + 1).map((iter, i) => ({
        x: iter.w.x,
        y: iter.w.y,
        iteration: i,
      })),
    }));
  }, [results, activeIter]);

  const errorData = useMemo(() => {
    if (results.length === 0) return [];
    const maxLen = Math.max(...results.map(r => r.iters.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: { iteration: number; [key: string]: number } = {
        iteration: i,
      };
      results.forEach(({ name, iters }) => {
        if (i < iters.length) {
          point[name] = l2Dist(iters[i].w, EXPECTED_VALUE);
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

      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[activeIter]}
            onValueChange={val => setActiveIter(val[0])}
            min={0}
            max={iterations}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="w-full h-[500px]">
          <div className="text-sm font-medium mb-2 text-center">
            Sample Distribution & SGD Trajectory
          </div>
          <ChartContainer config={{}}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[-SQUARE_SIZE, SQUARE_SIZE]}
                label={{ value: "X", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-SQUARE_SIZE, SQUARE_SIZE]}
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
                data={[EXPECTED_VALUE]}
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
        </div>

        <div className="w-full h-[400px]">
          <div className="text-sm font-medium mb-2 text-center">
            Estimation Error vs Iterations
          </div>
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
              <ChartTooltip content={<ChartTooltipContent />} />
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
    </div>
  );
}

function BatchSizeComparison() {
  const [iterations, setIterations] = useState(100);
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
    const newSamples = randomPoints(NUM_SAMPLES, SQUARE_SIZE, "square");
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
      iters: miniBatchSGDDemo(
        newSamples,
        alphaFn,
        iterations,
        INITIAL_W,
        batchSize,
      ),
      color,
    }));

    setResults(newResults);
  }, [iterations, runKey]);

  const [activeIter, setActiveIter] = useState(0);

  useEffect(() => {
    setActiveIter(Math.min(activeIter, iterations));
  }, [iterations, activeIter]);

  const trajectoryData = useMemo(() => {
    return results.map(({ name, iters, color }) => ({
      name,
      color,
      points: iters.slice(0, activeIter + 1).map((iter, i) => ({
        x: iter.w.x,
        y: iter.w.y,
        iteration: i,
      })),
    }));
  }, [results, activeIter]);

  const errorData = useMemo(() => {
    if (results.length === 0) return [];
    const maxLen = Math.max(...results.map(r => r.iters.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: { iteration: number; [key: string]: number } = {
        iteration: i,
      };
      results.forEach(({ name, iters }) => {
        if (i < iters.length) {
          point[name] = l2Dist(iters[i].w, EXPECTED_VALUE);
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
        <label className="m-2">Iterations:</label>
        {[100, 200, 500, 1000].map(option => (
          <Button
            key={option}
            variant={option === iterations ? "default" : "link"}
            onClick={() => {
              setIterations(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option}
          </Button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[activeIter]}
            onValueChange={val => setActiveIter(val[0])}
            min={0}
            max={iterations}
            step={1}
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="w-full h-[500px]">
          <div className="text-sm font-medium mb-2 text-center">
            Sample Distribution & MBGD Trajectory
          </div>
          {/* TODO: Enhanced interactive scatter plot */}
          <ChartContainer config={{}}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[-SQUARE_SIZE, SQUARE_SIZE]}
                label={{ value: "X", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[-SQUARE_SIZE, SQUARE_SIZE]}
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
                data={[EXPECTED_VALUE]}
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
        </div>

        <div className="w-full h-[400px]">
          <div className="text-sm font-medium mb-2 text-center">
            Estimation Error vs Iterations
          </div>
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
              <ChartTooltip content={<ChartTooltipContent />} />
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
    </div>
  );
}

export function SGDDemoPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-5xl">
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
