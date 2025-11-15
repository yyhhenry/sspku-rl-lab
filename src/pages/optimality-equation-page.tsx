import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SquarePi } from "lucide-react";

export function OptimalityEquationPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SquarePi />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>Optimality Equation</EmptyTitle>
    </Empty>
  );
}
