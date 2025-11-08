import { GridView } from "@/components/grid-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getPolicyExamples,
  gridActionEnum,
  gridActionIcon,
  safeGetCellAction,
  useGridEnv,
  useGridPolicy,
} from "@/lib/grid-env";

export function BellmanEquationsPage() {
  const [gridEnv] = useGridEnv();
  const [gridPolicy, setGridPolicy] = useGridPolicy();
  const cyclePolicy = (r: number, c: number) => {
    const action = safeGetCellAction(gridPolicy, r, c);
    const actionIdx = gridActionEnum.findIndex(v => v === action);
    const newAction = gridActionEnum[(actionIdx + 1) % gridActionEnum.length];
    const newActions = Array.from({ length: gridEnv.rows }, (_, row) =>
      Array.from({ length: gridEnv.cols }, (_, col) =>
        row === r && col === c
          ? newAction
          : safeGetCellAction(gridPolicy, row, col)
      )
    );
    setGridPolicy({ ...gridPolicy, actions: newActions });
  };
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-muted-foreground">Examples:</span>
            {getPolicyExamples(gridEnv.rows, gridEnv.cols).map(
              (example, idx) => (
                <Button
                  variant="link"
                  key={idx}
                  onClick={() => setGridPolicy(example.policy)}
                >
                  {example.name}
                </Button>
              )
            )}
          </div>
        </CardHeader>

        <CardContent className="overflow-x-auto">
          <div className="flex flex-col items-center gap-4 w-fit min-w-full">
            <GridView
              env={gridEnv}
              onClick={cyclePolicy}
              cell={(r, c) => {
                const ActionIcon =
                  gridActionIcon[safeGetCellAction(gridPolicy, r, c)];

                return <ActionIcon className="w-6 h-6 cursor-pointer" />;
              }}
            />
            <span className="flex items-center flex-wrap gap-1 mt-2 text-xs text-muted-foreground">
              <span>Click to cycle:</span>
              {gridActionEnum.map(action => {
                const ActionIcon = gridActionIcon[action];
                return (
                  <span
                    key={action}
                    className="flex items-center gap-1 border px-2 py-1 rounded"
                  >
                    <ActionIcon className="w-4 h-4" />
                    <span>{action}</span>
                  </span>
                );
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
