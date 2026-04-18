import type { ExpedienteTimelineItem } from "@/lib/build-expediente-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

type ExpedienteTimelineProps = {
  items: ExpedienteTimelineItem[];
  title?: string;
  compact?: boolean;
};

const kindStyles: Record<ExpedienteTimelineItem["kind"], string> = {
  plataforma: "border-slate-400 bg-slate-200 dark:border-slate-500 dark:bg-slate-500/30",
  expediente: "border-slate-400 bg-slate-200 dark:border-slate-500 dark:bg-slate-500/30",
  documento: "border-slate-400 bg-slate-200 dark:border-slate-500 dark:bg-slate-500/30",
  factura: "border-slate-400 bg-slate-200 dark:border-slate-500 dark:bg-slate-500/30",
  evento: "border-slate-400 bg-slate-200 dark:border-slate-500 dark:bg-slate-500/30",
  hito: "border-emerald-500 bg-emerald-500",
};

export const ExpedienteTimeline = ({
  items,
  title = "Línea de tiempo",
  compact = false,
}: ExpedienteTimelineProps) => {
  const visibleItems = compact ? items.slice(0, 12) : items;

  return (
    <Card className="rounded-xl border-0 bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-card dark:ring-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock
            className="h-4 w-4 text-slate-500 dark:text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle className="text-base font-semibold">
            {title}
          </CardTitle>
        </div>
        <p className="text-xs text-slate-500 dark:text-muted-foreground">
          Datos del expediente, documentos, facturas y acciones en la plataforma,
          en orden cronológico.
        </p>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aún no hay eventos para mostrar.
          </p>
        ) : (
          <ol className="relative ms-2 border-s-2 border-slate-200 ps-6 dark:border-slate-700">
            {visibleItems.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  "relative pb-6 last:pb-0",
                  index === 0 && "pt-0",
                )}
              >
                <span
                  className={cn(
                    "absolute -start-[calc(0.5rem+5px)] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                    kindStyles[item.kind],
                  )}
                  aria-hidden="true"
                />
                <time
                  className="text-xs font-medium text-slate-500 dark:text-muted-foreground"
                  dateTime={item.at}
                >
                  {new Date(item.at).toLocaleString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: item.kind === "factura" ? undefined : "2-digit",
                    minute: item.kind === "factura" ? undefined : "2-digit",
                  })}
                </time>
                <p className="mt-0.5 text-sm font-medium leading-snug">
                  {item.label}
                </p>
                {item.detail && (
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">
                    {item.detail}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
