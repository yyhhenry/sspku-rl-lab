import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { HashRouter, Route, Routes } from "react-router-dom";
import { useThemeEffect } from "./components/theme-provider";
import { HomePage } from "./pages/home-page";
import { SettingsPage } from "./pages/settings-page";

function withHeader(title: string, page: React.ReactNode) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{page}</div>
    </>
  );
}
export function App() {
  useThemeEffect();
  return (
    <HashRouter>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <Routes>
            <Route path="/" element={withHeader("Home", <HomePage />)} />
            <Route
              path="/settings"
              element={withHeader("Settings", <SettingsPage />)}
            />
            <Route path="/grid-env" element={withHeader("Grid Env", <></>)} />
            <Route
              path="/bellman-equations"
              element={withHeader("Bellman Equations", <></>)}
            />
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </HashRouter>
  );
}
