import { ExpedienteForm } from "@/components/expedientes/expediente-form";

const NuevoExpedientePage = () => {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Nuevo Expediente
        </h1>
        <p className="text-muted-foreground">
          Crea un nuevo expediente para gestionar tu caso
        </p>
      </div>
      <ExpedienteForm />
    </div>
  );
};

export default NuevoExpedientePage;
