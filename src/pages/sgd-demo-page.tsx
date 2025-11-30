import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TrendingDown } from "lucide-react";

export function SGDDemoPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TrendingDown />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>SSPKU RL Lab</EmptyTitle>
      <EmptyDescription>SGD Demo Page is under construction.</EmptyDescription>
    </Empty>
  );
}
