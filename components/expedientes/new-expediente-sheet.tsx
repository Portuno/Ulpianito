"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExpedienteForm } from "@/components/expedientes/expediente-form";

export const NewExpedienteSheet = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleCreated = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <FolderPlus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nuevo Expediente
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-2xl overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Nuevo Expediente</SheetTitle>
          <SheetDescription>
            Crea el expediente sin salir de la bandeja operativa.
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 pt-0">
          <ExpedienteForm inline onCreated={handleCreated} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
