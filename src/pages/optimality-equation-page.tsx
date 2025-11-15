import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OptimalityEquationPage() {
  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex flex-col items-center gap-4 my-2 w-fit min-w-full">
              TODO: Charts
            </div>
          </div>
          <Separator className="my-4" />

          <div className="w-full">
            <Tabs defaultValue="value-iteration">
              <div className="overflow-x-auto">
                <TabsList className="w-fit min-w-full">
                  <TabsTrigger value="value-iteration">
                    Value Iteration
                  </TabsTrigger>
                  <TabsTrigger value="policy-iteration">
                    Policy Iteration
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="value-iteration">
                TODO: Value Iteration
              </TabsContent>
              <TabsContent value="policy-iteration">
                TODO: Policy Iteration
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
