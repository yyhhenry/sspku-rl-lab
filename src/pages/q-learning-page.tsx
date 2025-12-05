import { GridView } from "@/components/grid-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  gridActionEnum,
  gridActionIcon,
  gridActionTransform,
  useGridEnv,
  useGridPolicy,
  useGridReward,
} from "@/lib/grid-env";
import { countStateAction, generateEpisode } from "@/lib/td-learning";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function QLearningPage() {
  const [runKey, setRunKey] = useState(0);
  const [env] = useGridEnv();
  const [reward] = useGridReward();
  const [policy] = useGridPolicy();

  const [epsilon, setEpsilon] = useState("1.0");
  const episodeLength = 1e5;

  const episode = useMemo(() => {
    return generateEpisode(env, policy, episodeLength, parseFloat(epsilon), {
      r: 0,
      c: 0,
      action: "idle",
    });
  }, [runKey, epsilon]);

  const stateActionCount = useMemo(() => {
    return countStateAction(env, episode);
  }, [episode]);
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(stateActionCount));
  }, [stateActionCount]);

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="flex my-2 gap-2 items-center flex-wrap">
            <label className="m-2">ε:</label>
            {["0.1", "0.5", "1.0"].map(option => (
              <Button
                key={option}
                variant={option === epsilon ? "default" : "link"}
                onClick={() => {
                  setEpsilon(option);
                  setRunKey(prev => prev + 1);
                }}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              <div className="text-sm">
                Use policy from{" "}
                <Button variant="link">
                  <Link to="/policy" className="flex items-center gap-1">
                    Policy Page <ArrowUpRight />
                  </Link>
                </Button>
              </div>
              <GridView
                className="m-4"
                env={env}
                cell={(r, c) => {
                  return (
                    <>
                      {gridActionEnum.map(action => {
                        const ActionIcon = gridActionIcon[action];
                        const curCount =
                          stateActionCount[`${r},${c},${action}`] ?? 0;
                        const opacity =
                          curCount > 0
                            ? 0.3 +
                              0.7 * Math.sqrt(curCount / Math.max(1, maxCount))
                            : 0;
                        return (
                          <span
                            className={cn(
                              "absolute text-xs",
                              gridActionTransform[action],
                            )}
                            style={{ opacity }}
                            key={action}
                          >
                            <ActionIcon />
                          </span>
                        );
                      })}
                    </>
                  );
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
