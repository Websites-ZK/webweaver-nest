import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  label: string;
  used: number;
  total: number;
  unit?: string;
}

const UsageBar = ({ label, used, total, unit = "GB" }: UsageBarProps) => {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-[hsl(45,93%,47%)]" : "bg-primary";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {used} / {total} {unit} ({pct}%)
        </span>
      </div>
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default UsageBar;
