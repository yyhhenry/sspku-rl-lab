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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gridActionIcon, useGridEnv } from "@/lib/grid-env";
import { useState } from "react";

function EpsilonExplorationAnalysis() {
  const [env] = useGridEnv();
  const [epsilon, setEpsilon] = useState("1.0");
  const [episodeLength, setEpisodeLength] = useState("100");

  return (
    <div className="m-2">
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select value={epsilon} onValueChange={setEpsilon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1.0">ε = 1.0</SelectItem>
            <SelectItem value="0.5">ε = 0.5</SelectItem>
          </SelectContent>
        </Select>

        <label className="text-sm">Episode Length:</label>
        <Select value={episodeLength} onValueChange={setEpisodeLength}>
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
          <div className="text-sm text-muted-foreground">
            Visualization: ε = {epsilon}, Episode Length = {episodeLength}
          </div>

          {/* Grid view - show visited state-action pairs */}
          <GridView
            className="my-2"
            env={env}
            cell={() => {
              return (
                <span className="text-xs">
                  {/* TODO: Implement algorithm to show visit count or probability */}
                  TBD
                </span>
              );
            }}
          />

          <div className="text-sm text-muted-foreground mt-4">
            <p>Statistics:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Visited state-action pairs: TODO</li>
              <li>
                Total possible state-action pairs: {env.rows * env.cols * 5}
              </li>
              <li>Coverage rate: TODO%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function EpsilonGreedyOptimality() {
  const [env] = useGridEnv();
  const [epsilon, setEpsilon] = useState("0.0");

  return (
    <div className="m-2">
      <div className="flex items-center gap-4 flex-wrap mb-2">
        <label className="text-sm">
          <Markdown content={"$\\varepsilon$ value:"} />
        </label>
        <Select value={epsilon} onValueChange={setEpsilon}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.0">ε = 0.0</SelectItem>
            <SelectItem value="0.1">ε = 0.1</SelectItem>
            <SelectItem value="0.2">ε = 0.2</SelectItem>
            <SelectItem value="0.5">ε = 0.5</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-sm text-muted-foreground mb-4">
        <Markdown
          content={
            "Environment: 5×5 grid, $\\gamma = 0.9$, $r_{\\text{boundary}} = -1$, $r_{\\text{forbidden}} = -10$, $r_{\\text{goal}} = +1$, $r_{\\text{other}} = 0$"
          }
        />
      </div>

      <div className="overflow-x-auto">
        <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
          <div className="text-sm font-medium">
            Optimal ε-greedy Policy (ε = {epsilon})
          </div>

          <GridView
            className="my-2"
            env={env}
            cell={() => {
              const ActionIcon = gridActionIcon["idle"];
              return <ActionIcon />;
            }}
          />

          <Separator className="my-2" />

          <div className="text-sm font-medium">State Value Function</div>

          <GridView
            className="my-2"
            env={env}
            cell={() => {
              return <span className="text-xs">0.0</span>;
            }}
          />

          <div className="text-sm text-muted-foreground mt-4">
            <p>Algorithm Parameters:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Exploration rate (ε): {epsilon}</li>
              <li>Discount factor (γ): 0.9</li>
              <li>Number of iterations: TODO</li>
              <li>Convergence threshold: TODO</li>
            </ul>
          </div>
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
          <Tabs defaultValue="exploration">
            <div className="overflow-x-auto">
              <TabsList className="w-fit min-w-full">
                <TabsTrigger value="exploration">
                  Exploration Analysis
                </TabsTrigger>
                <TabsTrigger value="optimality">
                  Optimality Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="exploration">
              <EpsilonExplorationAnalysis />
            </TabsContent>

            <TabsContent value="optimality">
              <EpsilonGreedyOptimality />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
