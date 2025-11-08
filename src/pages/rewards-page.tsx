import { LazyNumberInput } from "@/components/lazy-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getGridRewardExamples,
  gridCellColor,
  gridCellEnum,
  useGridReward,
} from "@/lib/grid-env";
import { cn } from "@/lib/utils";

export function RewardsPage() {
  const [gridReward, setGridReward] = useGridReward();

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center flex-wrap gap-2">
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
        <CardContent className="overflow-x-auto">
          <div className="flex flex-col items-center my-2 gap-2 w-fit min-w-full">
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm">Gamma</label>
              <LazyNumberInput
                className="w-20 text-center"
                step={0.01}
                value={gridReward.gamma}
                setValue={v => {
                  if (!isFinite(v)) v = 0.9;
                  if (v < 0.01) v = 0.01;
                  if (v > 0.99) v = 0.99;
                  setGridReward({ ...gridReward, gamma: v });
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm">Border</label>
              <LazyNumberInput
                className="w-20 text-center"
                step={0.1}
                value={gridReward.border}
                setValue={v => setGridReward({ ...gridReward, border: v })}
              />
            </div>
            <div className="w-75">
              <Separator />
            </div>
            {gridCellEnum.map(cell => (
              <div className="flex items-center gap-2" key={cell}>
                <div className="w-28 text-sm capitalize flex items-center gap-2">
                  <div
                    className={cn(
                      "inline-block w-4 h-4 ml-2 rounded-full border-2 border-muted-foreground",
                      gridCellColor[cell]
                    )}
                  />
                  <span>{cell}</span>
                </div>
                <LazyNumberInput
                  className="w-20 text-center"
                  step={0.1}
                  value={gridReward.cell[cell]}
                  setValue={v =>
                    setGridReward({
                      ...gridReward,
                      cell: { ...gridReward.cell, [cell]: v },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
