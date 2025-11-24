import { GridView } from "@/components/grid-view";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  gridActionEnum,
  gridActionIcon,
  gridActionTransform,
  useGridEnv,
} from "@/lib/grid-env";
import { explorationAnalysisDemo } from "@/lib/monte-carlo";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function EpsilonGreedyOptimality() {
  const [env] = useGridEnv();
  const [epsilon, setEpsilon] = useState("0.0");

  return (
    <div className="m-2">
      <div className="flex items-center justify-center gap-4 flex-wrap mb-2">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select value={epsilon} onValueChange={setEpsilon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.0">0.0</SelectItem>
            <SelectItem value="0.1">0.1</SelectItem>
            <SelectItem value="0.2">0.2</SelectItem>
            <SelectItem value="0.5">0.5</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView
            className="my-2"
            env={env}
            cell={() => {
              const ActionIcon = gridActionIcon["idle"];
              return <ActionIcon />;
            }}
          />

          <GridView
            className="my-2"
            env={env}
            cell={() => {
              return <span className="text-xs">0.0</span>;
            }}
          />
        </div>
      </div>
    </div>
  );
}

function EpsilonExplorationAnalysis() {
  const [env] = useGridEnv();
  const [epsilon, setEpsilon] = useState("1.0");
  const [episodeLength, setEpisodeLength] = useState(100);
  const [runKey, setRunKey] = useState(0);

  const [stateActionCount, setStateActionCount] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    explorationAnalysisDemo(env, parseFloat(epsilon), episodeLength).then(
      ({ stateActionCount }) => {
        setStateActionCount(stateActionCount);
      },
    );
  }, [env, epsilon, episodeLength, runKey]);

  const maxCount = useMemo(
    () => Object.values(stateActionCount).reduce((a, b) => Math.max(a, b), 0),
    [env, stateActionCount],
  );

  return (
    <div className="m-2">
      <div>
        <label>Examples:</label>
        {[1e2, 1e3, 1e4, 1e6].map(option => (
          <Button
            key={option}
            variant="link"
            onClick={() => {
              setEpisodeLength(option);
              setRunKey(prev => prev + 1);
            }}
          >
            {option} steps
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select value={epsilon} onValueChange={setEpsilon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.0">1.0</SelectItem>
            <SelectItem value="0.5">0.5</SelectItem>
          </SelectContent>
        </Select>

        <label>
          <Markdown
            content={"Episode Length: **" + episodeLength + "** steps"}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView
            className="my-2"
            env={env}
            cell={(r, c) => {
              return (
                <>
                  {gridActionEnum.map(action => {
                    const ActionIcon = gridActionIcon[action];
                    const curCount =
                      stateActionCount[`${r},${c},${action}`] ?? 0;
                    // 使用平方根归一化：让小值快速可见，大值区分度降低
                    // 0 -> 0, 有值 -> 至少0.3, maxCount -> 1.0
                    const opacity =
                      curCount > 0
                        ? 0.3 +
                          0.7 * Math.sqrt(curCount / Math.max(1, maxCount))
                        : 0;
                    return (
                      <span
                        className={cn(
                          "absolute text-xs",
                          gridActionTransform[action],
                        )}
                        style={{ opacity }}
                        key={action}
                      >
                        <ActionIcon />
                      </span>
                    );
                  })}
                </>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}
export function MonteCarloPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <Tabs defaultValue="optimality">
            <div className="overflow-x-auto">
              <TabsList className="w-fit min-w-full">
                <TabsTrigger value="optimality">
                  Optimality Analysis
                </TabsTrigger>
                <TabsTrigger value="exploration">
                  Exploration Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="optimality">
              <EpsilonGreedyOptimality />
            </TabsContent>

            <TabsContent value="exploration">
              <EpsilonExplorationAnalysis />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
