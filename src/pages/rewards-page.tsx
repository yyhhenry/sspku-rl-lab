import { InputOnBlur } from "@/components/input-on-blur";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getGridRewardExamples,
  gridCellColor,
  gridCellEnum,
  useGridReward,
} from "@/lib/grid-env";
import { Separator } from "@radix-ui/react-separator";
import { twMerge } from "tailwind-merge";

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
        <CardContent className="overflow-x-auto">
          <div className="flex flex-col items-center gap-2 w-fit min-w-full">
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm">Gamma</label>
              <InputOnBlur
                value={gridReward.gamma}
                setValue={s => {
                  let v = Number(s);
                  if (!isFinite(v)) v = 0.9;
                  if (v < 0.01) v = 0.01;
                  if (v > 0.99) v = 0.99;
                  setGridReward({
                    ...gridReward,
                    gamma: v,
                  });
                }}
                step={0.01}
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
                  setGridReward({
                    ...gridReward,
                    border: Number(e.target.value),
                  })
                }
                className="w-32"
              />
            </div>
            <Separator />
            {gridCellEnum.map(cell => (
              <div className="flex items-center gap-2" key={cell}>
                <div className="w-28 text-sm capitalize flex items-center gap-2">
                  <div
                    className={twMerge(
                      "inline-block w-4 h-4 ml-2 rounded-full",
                      gridCellColor[cell]
                    )}
                  />
                  <span>{cell}</span>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={gridReward.cell[cell]}
                  onChange={e =>
                    setGridReward({
                      ...gridReward,
                      cell: {
                        ...gridReward.cell,
                        [cell]: Number(e.target.value),
                      },
                    })
                  }
                  className="w-32"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
