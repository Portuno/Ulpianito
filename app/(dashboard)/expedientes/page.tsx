import { createClient } from "@/lib/supabase/server";
import { ExpedientesTable } from "@/components/expedientes/expedientes-table";
import { NewExpedienteSheet } from "@/components/expedientes/new-expediente-sheet";

const ExpedientesPage = async () => {
  const supabase = await createClient();

  const { data: expedientes } = await supabase
    .from("expedientes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <NewExpedienteSheet />
      </div>

      <ExpedientesTable expedientes={expedientes ?? []} />
    </div>
  );
};

export default ExpedientesPage;
