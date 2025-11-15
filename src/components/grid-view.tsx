import { gridCellColor, safeGetCell, type GridEnv } from "@/lib/grid-env";
import { arr } from "@/lib/tensor";
import { cn } from "@/lib/utils";

export function GridView({
  className,
  env,
  cell,
  onClick,
}: {
  className?: string;
  env: GridEnv;
  cell?: (r: number, c: number) => React.ReactNode;
  onClick?: (r: number, c: number) => void;
}) {
  return (
    <div className={cn("flex justify-center", className)}>
      <table className="border-collapse">
        <tbody>
          {arr(env.rows, r => (
            <tr key={r}>
              {arr(env.cols, c => (
                <td key={c} className="p-0">
                  <div
                    onClick={() => onClick?.(r, c)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center border cursor-pointer select-none hover:border-3 hover:border-blue-400 transition-border duration-150",
                      gridCellColor[safeGetCell(env, r, c)],
                    )}
                  >
                    {cell?.(r, c)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
