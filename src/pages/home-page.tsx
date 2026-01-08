import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Grid2X2Check } from "lucide-react";

function openGithub() {
  window.open("https://github.com/yyhhenry/sspku-rl-lab", "_blank");
}
export function HomePage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Grid2X2Check />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>
        <h1 className="font-bold font-serif italic">SSPKU RL Lab</h1>
      </EmptyTitle>
      <EmptyDescription>
        <p>SSPKU Reinforcement Learning Lab</p>
        <p>
          <Button variant="link" onClick={openGithub}>
            yyhhenry/sspku-rl-lab
          </Button>
        </p>
        <p>特别鸣谢：郁老师</p>
      </EmptyDescription>
    </Empty>
  );
}
