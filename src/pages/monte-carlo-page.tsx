import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Dices } from "lucide-react";

export function MonteCarloPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Dices />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Monte Carlo</EmptyTitle>
      <EmptyDescription>
        <p>Monte Carlo methods coming soon...</p>
      </EmptyDescription>
    </Empty>
  );
}
