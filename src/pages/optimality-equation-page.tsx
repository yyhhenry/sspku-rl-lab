import { GridView } from "@/components/grid-view";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createDefaultGridPolicy,
  gridActionIcon,
  optimalPolicyIteration,
  optimalValueIteration,
  rcToIndex,
  safeGetCellAction,
  useGridEnv,
  useGridReward,
  type GridEnv,
  type OptimalityIter,
} from "@/lib/grid-env";
import { arr, avg } from "@/lib/tensor";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, XAxis, YAxis } from "recharts";

export function ItersWithSlider({
  env,
  iters,
  activeIter,
  setActiveIter,
}: {
  env: GridEnv;
  iters: OptimalityIter[];
  activeIter: number;
  setActiveIter: (activeIter: number) => void;
}) {
  const policy = useMemo(() => {
    return iters[activeIter]?.policy ?? createDefaultGridPolicy();
  }, [iters, activeIter]);
  const valueTensor = useMemo(() => {
    return iters[activeIter]?.value ?? [];
  }, [iters, activeIter]);
  return (
    <div className="m-2">
      <div className="mb-4 flex items-center justify-center">
        <div className="m-2">Iteration {activeIter}:</div>
        <div className="w-sm">
          <Slider
            value={[activeIter]}
            onValueChange={val => setActiveIter(val[0])}
            min={0}
            max={iters.length - 1}
            step={1}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => {
              const ActionIcon =
                gridActionIcon[safeGetCellAction(policy, r, c)];
              return <ActionIcon className="w-6 h-6" />;
            }}
          />
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => (
              <span className="text-xs">
                {valueTensor[rcToIndex(env, r, c)]?.toFixed(1) ?? ""}
              </span>
            )}
          />
        </div>
      </div>
    </div>
  );
}
export function OptimalityEquationPage() {
  const [env] = useGridEnv();
  const [reward] = useGridReward();

  const [valueNumIters, setValueNumIters] = useState(2);
  const [chartIters, setChartIters] = useState(30);

  const preciseValue = useMemo(() => {
    const iters = optimalValueIteration(env, reward, {
      numIters: Infinity,
      tolerance: 1e-6,
    });
    return iters[iters.length - 1]?.value ?? [];
  }, [env, reward]);

  const valueIters = useMemo(() => {
    return optimalValueIteration(env, reward);
  }, [env, reward]);
  const policyIters = useMemo(() => {
    return optimalPolicyIteration(env, reward);
  }, [env, reward]);
  const truncatedIters = useMemo(() => {
    return optimalPolicyIteration(env, reward, {
      valueNumIters,
    });
  }, [env, reward, valueNumIters]);

  const preciseAvg = useMemo(() => avg(preciseValue), [preciseValue]);
  const valueItersAvg = useMemo(
    () => valueIters.map(iter => avg(iter.value)),
    [valueIters],
  );
  const policyItersAvg = useMemo(
    () => policyIters.map(iter => avg(iter.value)),
    [policyIters],
  );
  const truncatedItersAvg = useMemo(
    () => truncatedIters.map(iter => avg(iter.value)),
    [truncatedIters],
  );

  const chartData = useMemo(() => {
    const safeGetAvg = (avg: number[], iter: number) => {
      return avg[iter] ?? avg[avg.length - 1] ?? 0;
    };
    return arr(chartIters, i => i + 1).map(iter => ({
      iter,
      preciseAvg,
      valueAvg: safeGetAvg(valueItersAvg, iter),
      policyAvg: safeGetAvg(policyItersAvg, iter),
      truncatedAvg: safeGetAvg(truncatedItersAvg, iter),
    }));
  }, [
    preciseAvg,
    valueItersAvg,
    policyItersAvg,
    truncatedItersAvg,
    chartIters,
  ]);

  const [valueActiveIter, setValueActiveIter] = useState(0);
  const [policyActiveIter, setPolicyActiveIter] = useState(0);
  const [truncatedActiveIter, setTruncatedActiveIter] = useState(0);

  useEffect(() => {
    setValueActiveIter(valueIters.length - 1);
  }, [valueIters]);
  useEffect(() => {
    setPolicyActiveIter(policyIters.length - 1);
  }, [policyIters]);
  useEffect(() => {
    setTruncatedActiveIter(truncatedIters.length - 1);
  }, [truncatedIters]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              <ChartContainer
                className="w-full"
                config={{
                  preciseAvg: {
                    label: "Precise",
                    color: "var(--chart-1)",
                  },
                  valueAvg: {
                    label: "Value Iteration",
                    color: "var(--chart-2)",
                  },
                  policyAvg: {
                    label: "Policy Iteration",
                    color: "var(--chart-3)",
                  },
                  truncatedAvg: {
                    label: `Truncated-${valueNumIters} Iteration`,
                    color: "var(--chart-4)",
                  },
                }}
              >
                <LineChart accessibilityLayer data={chartData}>
                  <XAxis dataKey="iter" />
                  <YAxis dataKey="preciseAvg" />
                  <ChartTooltip
                    content={<ChartTooltipContent hideLabel={true} />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="preciseAvg"
                    stroke="var(--chart-1)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="valueAvg"
                    stroke="var(--chart-2)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="policyAvg"
                    stroke="var(--chart-3)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="truncatedAvg"
                    stroke="var(--chart-4)"
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>

              <div className="flex items-center gap-4 justify-center">
                <label className="text-sm">Truncated-x Iteration</label>
                <Select
                  value={valueNumIters.toString()}
                  onValueChange={val => setValueNumIters(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">x = 1</SelectItem>
                    <SelectItem value="2">x = 2</SelectItem>
                    <SelectItem value="4">x = 4</SelectItem>
                    <SelectItem value="12">x = 12</SelectItem>
                    <SelectItem value="80">x = 80</SelectItem>
                  </SelectContent>
                </Select>
                <label className="text-sm">
                  <Markdown content={`Chart Iters`} />
                </label>
                <Select
                  value={chartIters.toString()}
                  onValueChange={val => setChartIters(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Separator className="my-4" />

          <div className="w-full">
            <Tabs defaultValue="value-iteration">
              <div className="overflow-x-auto">
                <TabsList className="w-fit min-w-full">
                  <TabsTrigger value="value-iteration">
                    Value Iteration
                  </TabsTrigger>
                  <TabsTrigger value="policy-iteration">
                    Policy Iteration
                  </TabsTrigger>
                  <TabsTrigger value="truncated-policy-iteration">
                    Truncated Policy Iteration
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="value-iteration">
                <ItersWithSlider
                  env={env}
                  iters={valueIters}
                  activeIter={valueActiveIter}
                  setActiveIter={setValueActiveIter}
                />
              </TabsContent>
              <TabsContent value="policy-iteration">
                <ItersWithSlider
                  env={env}
                  iters={policyIters}
                  activeIter={policyActiveIter}
                  setActiveIter={setPolicyActiveIter}
                />
              </TabsContent>
              <TabsContent value="truncated-policy-iteration">
                <ItersWithSlider
                  env={env}
                  iters={truncatedIters}
                  activeIter={truncatedActiveIter}
                  setActiveIter={setTruncatedActiveIter}
                />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
