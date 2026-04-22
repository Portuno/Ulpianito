import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderOpen, ShieldCheck, ArrowRight } from "lucide-react";

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
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const Icon = iconMap[action.icon];
          return (
            <div
              key={action.href}
              className="rounded-md border p-3 transition-colors hover:bg-muted/40"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Tarea {index + 1}</span>
                <span>Prioridad {action.priority}</span>
              </div>
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{action.detail}</p>
              <Button
                asChild
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="mt-3 w-full justify-between"
              >
                <Link href={action.href}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    Ir ahora
                  </span>
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
