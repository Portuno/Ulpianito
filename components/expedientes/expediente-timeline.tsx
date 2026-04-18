import type { ExpedienteTimelineItem } from "@/lib/build-expediente-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarClock } from "lucide-react";

type ExpedienteTimelineProps = {
  items: ExpedienteTimelineItem[];
};

const kindStyles: Record<ExpedienteTimelineItem["kind"], string> = {
  plataforma:
    "border-emerald-500/80 bg-emerald-500/10 dark:bg-emerald-500/15",
  expediente:
    "border-sky-500/80 bg-sky-500/10 dark:bg-sky-500/15",
  documento:
    "border-amber-500/80 bg-amber-500/10 dark:bg-amber-500/15",
  factura:
    "border-violet-500/80 bg-violet-500/10 dark:bg-violet-500/15",
  evento:
    "border-rose-500/80 bg-rose-500/10 dark:bg-rose-500/15",
  hito:
    "border-fuchsia-500/80 bg-fuchsia-500/10 dark:bg-fuchsia-500/15",
};

export const ExpedienteTimeline = ({ items }: ExpedienteTimelineProps) => {
  return (
    <Card className="border-primary/15 bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle className="text-base font-semibold">
            Línea de tiempo
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
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
          <ol className="relative ms-2 border-s-2 border-primary/20 ps-6">
            {items.map((item, index) => (
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
                  className="text-xs font-medium text-muted-foreground"
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
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
