import { GridView } from "@/components/grid-view";
import { Markdown } from "@/components/markdown";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gridActionIcon, useGridEnv } from "@/lib/grid-env";
import { useState } from "react";

function EpsilonGreedyOptimality() {
  const [env] = useGridEnv();
  const [epsilon, setEpsilon] = useState(0.0);

  return (
    <div className="m-2">
      <div className="flex items-center justify-center gap-4 flex-wrap mb-2">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select
          value={epsilon.toString()}
          onValueChange={s => setEpsilon(parseFloat(s))}
        >
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
  const [epsilon, setEpsilon] = useState(1.0);
  const [episodeLength, setEpisodeLength] = useState(100);

  return (
    <div className="m-2">
      <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select
          value={epsilon.toString()}
          onValueChange={s => setEpsilon(parseFloat(s))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.0">1.0</SelectItem>
            <SelectItem value="0.5">0.5</SelectItem>
          </SelectContent>
        </Select>

        <label className="text-sm">Episode Length:</label>
        <Select
          value={episodeLength.toString()}
          onValueChange={s => setEpisodeLength(parseInt(s))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="100">100 steps</SelectItem>
            <SelectItem value="1000">1,000 steps</SelectItem>
            <SelectItem value="10000">10,000 steps</SelectItem>
            <SelectItem value="1000000">1,000,000 steps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <GridView className="my-2" env={env} />
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
