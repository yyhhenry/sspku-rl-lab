import { gridCellColor, safeGetCell, type GridEnv } from "@/lib/grid-env";
import { twMerge } from "tailwind-merge";

export function GridView({
  env,
  cell,
  onClick,
}: {
  env: GridEnv;
  cell?: (r: number, c: number) => React.ReactNode;
  onClick?: (r: number, c: number) => void;
}) {
  return (
    <div className="flex justify-center">
      <table className="border-collapse">
        <tbody>
          {Array.from({ length: env.rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: env.cols }, (_, c) => (
                <td key={c} className="p-0">
                  <div
                    onClick={() => onClick?.(r, c)}
                    className={twMerge(
                      "w-10 h-10 flex items-center justify-center border cursor-pointer select-none hover:border-3 hover:border-blue-400 border transition-all duration-150",
                      gridCellColor[safeGetCell(env, r, c)]
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
