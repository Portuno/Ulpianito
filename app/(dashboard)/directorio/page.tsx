import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, UserRoundCog } from "lucide-react";

const DirectorioPage = () => {
  const roles = [
    { name: "Socio", scope: "Estrategia y aprobaciones finales" },
    { name: "Asociado", scope: "Produccion juridica y supervision de IA" },
    { name: "Paralegal", scope: "Carga documental y control operativo" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Directorio</h1>
        <p className="text-muted-foreground">
          Vista de equipos, roles y responsabilidad operativa del despacho.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="space-y-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Equipo activo</CardTitle>
            <CardDescription>Personas habilitadas en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">12</p>
            <p className="text-sm text-muted-foreground">
              Ajustable cuando conectes datos reales de perfiles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Unidades</CardTitle>
            <CardDescription>Distribucion por area funcional.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">Litigios</Badge>
            <Badge variant="secondary">Compliance</Badge>
            <Badge variant="secondary">Contratos</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <UserRoundCog className="h-5 w-5 text-primary" />
            <CardTitle>Roles y permisos</CardTitle>
            <CardDescription>Matriz base para gobierno de accesos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => (
              <div key={role.name} className="rounded-md border p-2">
                <p className="text-sm font-medium">{role.name}</p>
                <p className="text-xs text-muted-foreground">{role.scope}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorioPage;
