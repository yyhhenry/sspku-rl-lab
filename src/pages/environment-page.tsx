import { GridView } from "@/components/grid-view";
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
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-xl">
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
        <CardContent>
          <GridView env={gridEnv} onClick={cycleCell} />
          <div className="flex justify-center">
            <span className="mt-2 text-xs text-muted-foreground">
              Click a cell to cycle: empty → forbidden → goal
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
