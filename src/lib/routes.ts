import { BellmanEquationsPage } from "@/pages/bellman-equations-page";
import { EnvironmentPage } from "@/pages/environment-page";
import { RewardsPage } from "@/pages/rewards-page";
import { Grid, Lollipop, Workflow } from "lucide-react";

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
    path: "/bellman-equations",
    name: "Bellman Equations",
    icon: Workflow,
    page: BellmanEquationsPage,
  },
] as const;
