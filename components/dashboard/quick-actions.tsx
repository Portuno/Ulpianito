import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderOpen, ShieldCheck, ArrowRight, CircleCheck } from "lucide-react";

type ActionItem = {
  href: string;
  label: string;
  detail: string;
  icon: "create" | "list" | "review";
  priority: "Alta" | "Media";
};

const iconMap = {
  create: FolderPlus,
  list: FolderOpen,
  review: ShieldCheck,
} as const;

export const QuickActions = ({ actions }: { actions: ActionItem[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Siguiente mejor acción</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon];
          return (
            <div
              key={action.href}
              className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <CircleCheck className="h-4 w-4 text-muted-foreground" />
              <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{action.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  Prioridad {action.priority} · {action.detail}
                </p>
              </div>
              <Button
                asChild
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="shrink-0 justify-between"
              >
                <Link href={action.href}>
                  Ir
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
