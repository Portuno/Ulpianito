import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, UserRoundCog } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DirectorioPage = () => {
  const roles = [
    { name: "Socio", scope: "Estrategia y aprobaciones finales", users: 2 },
    { name: "Asociado", scope: "Producción jurídica y supervisión de IA", users: 4 },
    { name: "Paralegal", scope: "Carga documental y control operativo", users: 6 },
  ];

  const unidades = [
    { unidad: "Litigios", integrantes: 5, expedientesActivos: 14 },
    { unidad: "Compliance", integrantes: 3, expedientesActivos: 8 },
    { unidad: "Contratos", integrantes: 4, expedientesActivos: 9 },
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
          <CardHeader className="space-y-2 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Equipo activo</CardTitle>
            <CardDescription>Personas habilitadas para operar.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">12</p>
            <p className="text-sm text-muted-foreground">
              Ajustable cuando conectes datos reales de perfiles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Unidades</CardTitle>
            <CardDescription>Distribución por área funcional.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">Litigios</Badge>
            <Badge variant="secondary">Compliance</Badge>
            <Badge variant="secondary">Contratos</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-2">
            <UserRoundCog className="h-5 w-5 text-primary" />
            <CardTitle>Roles y permisos</CardTitle>
            <CardDescription>Matriz base para gobierno de accesos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">3</p>
            <p className="text-sm text-muted-foreground">Perfiles de acceso definidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz de roles operativos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Responsabilidad</TableHead>
                  <TableHead className="text-right">Usuarios</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.name}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{role.scope}</TableCell>
                    <TableCell className="text-right">{role.users}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacidad por unidad</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Integrantes</TableHead>
                  <TableHead className="text-right">Casos activos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.map((unidad) => (
                  <TableRow key={unidad.unidad}>
                    <TableCell className="font-medium">{unidad.unidad}</TableCell>
                    <TableCell>{unidad.integrantes}</TableCell>
                    <TableCell className="text-right">{unidad.expedientesActivos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorioPage;
