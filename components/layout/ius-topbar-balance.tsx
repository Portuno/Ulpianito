"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

type IusTopbarBalanceProps = {
  balance: number;
};

export const IusTopbarBalance = ({ balance }: IusTopbarBalanceProps) => {
  return (
    <HoverCard openDelay={250} closeDelay={200}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className="flex max-w-[min(100%,11rem)] items-center gap-2 rounded-full border bg-muted/60 px-2 py-1 text-xs font-semibold sm:px-3 sm:text-sm"
          aria-label={`Saldo IUS: ${balance}. Más información sobre IUS`}
        >
          <Coins className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span className="min-w-0 truncate tabular-nums">{balance} IUS</span>
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="z-50 w-72 space-y-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
        align="end"
        sideOffset={8}
      >
        <p className="text-sm leading-relaxed">
          Los IUS son la moneda nativa y local de Ulpianito. Para más
          información, tocá o hacé clic abajo.
        </p>
        <Link
          href="/ius"
          className="inline-flex text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/90"
        >
          Más sobre Ius
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};
