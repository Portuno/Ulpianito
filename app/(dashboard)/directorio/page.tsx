import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, UserRoundCog } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProfileDirectory = {
  id: string;
  nombre: string | null;
  apellido: string | null;
  rol: string | null;
};

type ExpedienteDirectory = {
  id: string;
  tipo: string | null;
  estado: string | null;
  created_by: string | null;
};

const roleScopeMap: Record<string, string> = {
  admin: "Gobierno de acceso y configuración operativa.",
  jurista: "Producción jurídica y supervisión de calidad.",
  abogado: "Gestión legal y resolución de casos.",
  asociado: "Ejecución técnica y seguimiento de expedientes.",
  paralegal: "Carga documental y control de soporte.",
};

const defaultScope = "Responsabilidad definida por la operación del despacho.";

const normalizeLabel = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const normalized = value.trim();
  if (!normalized) return fallback;
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const DirectorioPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("despacho_id")
    .eq("id", user.id)
    .single();

  if (!profile?.despacho_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Directorio</h1>
          <p className="text-muted-foreground">
            No pudimos identificar tu despacho para construir el directorio.
          </p>
        </div>
      </div>
    );
  }

  const [{ data: profiles }, { data: expedientes }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nombre, apellido, rol")
      .eq("despacho_id", profile.despacho_id),
    supabase
      .from("expedientes")
      .select("id, tipo, estado, created_by")
      .eq("despacho_id", profile.despacho_id),
  ]);

  const members = (profiles ?? []) as ProfileDirectory[];
  const cases = (expedientes ?? []) as ExpedienteDirectory[];

  const rolesByCount = new Map<string, number>();
  members.forEach((member) => {
    const roleKey = (member.rol ?? "sin_rol").trim().toLowerCase() || "sin_rol";
    rolesByCount.set(roleKey, (rolesByCount.get(roleKey) ?? 0) + 1);
  });

  const roles = [...rolesByCount.entries()]
    .map(([roleKey, users]) => ({
      name: normalizeLabel(roleKey === "sin_rol" ? "Sin rol" : roleKey, "Sin rol"),
      scope: roleScopeMap[roleKey] ?? defaultScope,
      users,
    }))
    .sort((a, b) => b.users - a.users);

  const membersById = new Map(members.map((member) => [member.id, member]));
  const unitsAccumulator = new Map<string, { integrantes: Set<string>; expedientesActivos: number }>();

  cases.forEach((expediente) => {
    const unitKey = normalizeLabel(expediente.tipo, "General");
    const current = unitsAccumulator.get(unitKey) ?? { integrantes: new Set<string>(), expedientesActivos: 0 };
    if ((expediente.estado ?? "").toLowerCase() === "activo") {
      current.expedientesActivos += 1;
    }
    const creatorId = expediente.created_by ?? "";
    if (creatorId && membersById.has(creatorId)) {
      current.integrantes.add(creatorId);
    }
    unitsAccumulator.set(unitKey, current);
  });

  const unidades = [...unitsAccumulator.entries()]
    .map(([unidad, data]) => ({
      unidad,
      integrantes: data.integrantes.size,
      expedientesActivos: data.expedientesActivos,
    }))
    .sort((a, b) => b.expedientesActivos - a.expedientesActivos);

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
            <p className="text-3xl font-semibold tracking-tight">{members.length}</p>
            <p className="text-sm text-muted-foreground">
              Basado en perfiles del despacho actualmente registrados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Unidades</CardTitle>
            <CardDescription>Distribución real por tipo de expediente.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {unidades.length > 0 ? (
              unidades.map((unidad) => (
                <Badge key={unidad.unidad} variant="secondary">{unidad.unidad}</Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin expedientes cargados todavía.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2 pb-2">
            <UserRoundCog className="h-5 w-5 text-primary" />
            <CardTitle>Roles y permisos</CardTitle>
            <CardDescription>Matriz base para gobierno de accesos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight">{roles.length}</p>
            <p className="text-sm text-muted-foreground">Perfiles de acceso realmente asignados</p>
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
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <TableRow key={role.name}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{role.scope}</TableCell>
                      <TableCell className="text-right">{role.users}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      Sin roles asignados todavía en perfiles.
                    </TableCell>
                  </TableRow>
                )}
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
                {unidades.length > 0 ? (
                  unidades.map((unidad) => (
                    <TableRow key={unidad.unidad}>
                      <TableCell className="font-medium">{unidad.unidad}</TableCell>
                      <TableCell>{unidad.integrantes}</TableCell>
                      <TableCell className="text-right">{unidad.expedientesActivos}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-muted-foreground">
                      No hay capacidad operativa para mostrar porque aún no hay expedientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorioPage;
