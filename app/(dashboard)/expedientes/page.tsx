import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { ExpedientesTable } from "@/components/expedientes/expedientes-table";

const ExpedientesPage = async () => {
  const supabase = await createClient();

  const { data: expedientes } = await supabase
    .from("expedientes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expedientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus expedientes y casos
          </p>
        </div>
        <Button asChild>
          <Link href="/expedientes/nuevo">
            <FolderPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nuevo Expediente
          </Link>
        </Button>
      </div>

      <ExpedientesTable expedientes={expedientes ?? []} />
    </div>
  );
};

export default ExpedientesPage;
