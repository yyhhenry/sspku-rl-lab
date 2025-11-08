import { ThemeSelect } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="flex items-center gap-4">
            <span>Theme</span>
            <ThemeSelect />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
