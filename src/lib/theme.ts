import { createZodStore } from "@/lib/zod-store";
import { useEffect } from "react";
import z from "zod";
export const themeOptions = ["dark", "light", "system"] as const;
export const ThemeSchema = z.enum(themeOptions);
export type Theme = z.infer<typeof ThemeSchema>;

export const useTheme = createZodStore(
  "theme",
  ThemeSchema,
  () => "system" as Theme,
);

export function useIsDark() {
  const [theme] = useTheme();
  const isSystemDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return theme === "dark" || (theme === "system" && isSystemDark);
}

export function applyTheme(theme: Theme) {
  const root = window.document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    root.classList.add(systemTheme);
    return;
  }

  root.classList.add(theme);
}

/**
 * A React hook that applies the current theme to the document root element.
 * Should be used at the root of the application.
 */
export function useThemeEffect() {
  const [theme] = useTheme();
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
}
