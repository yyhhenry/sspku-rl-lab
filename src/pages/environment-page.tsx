import { GridView } from "@/components/grid-view";
import { NumberInput } from "@/components/refined-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getGridExamples,
  gridCellEnum,
  safeGetCell,
  useGridEnv,
} from "@/lib/grid-env";

export function EnvironmentPage() {
  const [gridEnv, setGridEnv] = useGridEnv();
  const cycleCell = (r: number, c: number) => {
    const cell = safeGetCell(gridEnv, r, c);
    const cellIdx = gridCellEnum.findIndex(v => v === cell);
    const newCell = gridCellEnum[(cellIdx + 1) % gridCellEnum.length];
    const newCells = Array.from({ length: gridEnv.rows }, (_, row) =>
      Array.from({ length: gridEnv.cols }, (_, col) =>
        row === r && col === c ? newCell : safeGetCell(gridEnv, row, col)
      )
    );
    setGridEnv({ ...gridEnv, cells: newCells });
  };
  const refineSize = (v: number) => {
    v = Math.floor(v);
    if (!isFinite(v)) v = 5;
    if (v < 1) v = 1;
    if (v > 10) v = 10;
    return v;
  };
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center">
            <span className="text-muted-foreground">Examples:</span>
            {getGridExamples().map((example, idx) => (
              <Button
                variant="link"
                key={idx}
                onClick={() => setGridEnv(example.env)}
              >
                {example.name}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex flex-col items-center gap-4 w-fit min-w-full">
            <div className="flex items-center gap-2">
              <NumberInput
                value={gridEnv.rows}
                setValue={v => {
                  setGridEnv({
                    ...gridEnv,
                    rows: refineSize(v),
                  });
                }}
                className="w-20"
              />
              <span>x</span>
              <NumberInput
                value={gridEnv.cols}
                setValue={v => {
                  setGridEnv({
                    ...gridEnv,
                    cols: refineSize(v),
                  });
                }}
                className="w-20"
              />
            </div>
            <GridView env={gridEnv} onClick={cycleCell} />
            <span className="mt-2 text-xs text-muted-foreground">
              Click a cell to cycle: empty → forbidden → goal
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
