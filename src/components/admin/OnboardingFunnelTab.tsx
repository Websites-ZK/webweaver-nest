import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FunnelStep {
  step: number;
  entered: number;
  completed: number;
  abandoned: number;
}

const STEP_NAMES = ["Plan Selection", "Domain Setup", "Add Extras", "Review & Confirm", "Checkout"];

const OnboardingFunnelTab = () => {
  const { t } = useLanguage();
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_onboarding_funnel");
      if (data && Array.isArray(data)) setFunnel(data as FunnelStep[]);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const maxEntered = Math.max(...funnel.map((s) => s.entered), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">{t("admin.onboardingFunnel")}</h2>

      {funnel.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center text-muted-foreground">{t("admin.noFunnelData")}</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {funnel.map((step) => {
            const pct = ((step.entered / maxEntered) * 100).toFixed(1);
            const completionRate = step.entered > 0 ? ((step.completed / step.entered) * 100).toFixed(1) : "0.0";
            const dropOff = step.entered > 0 ? ((step.abandoned / step.entered) * 100).toFixed(1) : "0.0";

            return (
              <Card key={step.step} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-foreground">{STEP_NAMES[step.step] || `Step ${step.step}`}</p>
                      <p className="text-xs text-muted-foreground">
                        {step.entered} entered · {step.completed} completed · {step.abandoned} abandoned
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="text-green-500 font-semibold">{completionRate}%</span>
                      <span className="text-muted-foreground mx-1">|</span>
                      <span className="text-red-500 font-semibold">{dropOff}% drop</span>
                    </div>
                  </div>
                  <Progress value={parseFloat(pct)} className="h-2" />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OnboardingFunnelTab;
