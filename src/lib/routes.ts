import { BellmanEquationPage } from "@/pages/bellman-equation-page";
import { EnvironmentPage } from "@/pages/environment-page";
import { MonteCarloPage } from "@/pages/monte-carlo-page";
import { OptimalityEquationPage } from "@/pages/optimality-equation-page";
import { RewardsPage } from "@/pages/rewards-page";
import { SGDDemoPage } from "@/pages/sgd-demo-page";
import {
  Calculator,
  Dices,
  Grid,
  Lollipop,
  SquarePi,
  TrendingDown,
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
    path: "/rewards",
    name: "Rewards",
    icon: Lollipop,
    page: RewardsPage,
  },
  {
    path: "/bellman-equation",
    name: "Bellman Equation",
    icon: Calculator,
    page: BellmanEquationPage,
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
