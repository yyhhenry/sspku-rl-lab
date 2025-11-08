import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeSchema, useTheme } from "@/lib/theme";

function ThemeSelect() {
  const [theme, setTheme] = useTheme();
  const updateTheme = (newValue: string) => {
    const parsed = ThemeSchema.safeParse(newValue);
    if (!parsed.success) return;
    setTheme(parsed.data);
  };
  return (
    <Select value={theme} onValueChange={updateTheme}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function SettingsPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-4 my-2">
            <span>Theme</span>
            <ThemeSelect />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
