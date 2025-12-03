import { EnvironmentPage } from "@/pages/environment-page";
import { MonteCarloPage } from "@/pages/monte-carlo-page";
import { OptimalityEquationPage } from "@/pages/optimality-equation-page";
import { PolicyPage } from "@/pages/policy-page";
import { RewardPage } from "@/pages/reward-page";
import { SGDDemoPage } from "@/pages/sgd-demo-page";
import {
  Dices,
  Grid,
  Lollipop,
  SquarePi,
  TrendingDown,
  Workflow,
} from "lucide-react";

export interface RouteItem {
  path: string;
  name: string;
  icon?: React.ElementType;
  page?: React.ElementType;
}
export const routes: RouteItem[] = [
  {
    path: "/environment",
    name: "Environment",
    icon: Grid,
    page: EnvironmentPage,
  },
  {
    path: "/reward",
    name: "Reward",
    icon: Lollipop,
    page: RewardPage,
  },
  {
    path: "/policy",
    name: "Policy",
    icon: Workflow,
    page: PolicyPage,
  },
  {
    path: "/optimality-equation",
    name: "Optimality Equation",
    icon: SquarePi,
    page: OptimalityEquationPage,
  },
  {
    path: "/monte-carlo",
    name: "Monte Carlo",
    icon: Dices,
    page: MonteCarloPage,
  },
  {
    path: "/sgd-demo",
    name: "SGD Demo",
    icon: TrendingDown,
    page: SGDDemoPage,
  },
] as const;
