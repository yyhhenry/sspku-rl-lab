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
import { HashRouter, Route, Routes } from "react-router-dom";
import { Separator } from "./components/ui/separator";
import { Toaster } from "./components/ui/sonner";
import { routes } from "./lib/routes";
import { useThemeEffect } from "./lib/theme";
import { HomePage } from "./pages/home-page";
import { SettingsPage } from "./pages/settings-page";

function withHeader(title: string, page: React.ReactNode) {
  return (
    <>
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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

      <div className="flex flex-1 flex-col gap-4 p-4">{page}</div>
    </>
  );
}
export function App() {
  useThemeEffect();
  return (
    <HashRouter>
      <Toaster />
      <SidebarProvider>
        <AppSidebar variant="floating" />
        <SidebarInset>
          <Routes>
            <Route path="/" element={withHeader("Home", <HomePage />)} />
            <Route
              path="/settings"
              element={withHeader("Settings", <SettingsPage />)}
            />
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={withHeader(route.name, route.page && <route.page />)}
              />
            ))}
          </Routes>
        </SidebarInset>
      </SidebarProvider>
    </HashRouter>
  );
}
