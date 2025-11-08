import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getGridRewardExamples, useGridReward } from "@/lib/grid-env";

export function RewardsPage() {
  const [gridReward, setGridReward] = useGridReward();
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center">
            <span className="text-muted-foreground">Examples:</span>
            {getGridRewardExamples().map((example, idx) => (
              <Button
                variant="link"
                key={idx}
                onClick={() => setGridReward(example.reward)}
              >
                {example.name}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">Gamma</label>
            <Input
              type="number"
              step="0.01"
              value={gridReward.gamma}
              onChange={e =>
                setGridReward({ ...gridReward, gamma: Number(e.target.value) })
              }
              className="w-32"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-28 text-sm">Border</label>
            <Input
              type="number"
              step="0.1"
              value={gridReward.border}
              onChange={e =>
                setGridReward({ ...gridReward, border: Number(e.target.value) })
              }
              className="w-32"
            />
          </div>
          {/*
            <div class="flex items-center gap-2">
              <label class="w-28 text-sm">Border</label>
              <Input type="number" step="0.1" v-model.number="env.reward.border" class="w-32" />
            </div>
            <Separator />
            <div class="flex items-center gap-2" v-for="t in gridCellEnum" :key="t">
              <div class="w-28 text-sm capitalize flex items-center gap-2">
                <div :class="['inline-block w-4 h-4 ml-2 rounded-full', gridCellColor[t]]"></div>
                <span>{{ t }}</span>
              </div>
              <Input type="number" step="0.01" v-model.number="env.reward.cell[t]" class="w-32" />
            </div>
          </div>
                */}
        </CardContent>
      </Card>
    </div>
  );
}
