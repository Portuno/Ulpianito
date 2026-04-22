# Ulpianito v0.9 - Seguridad, roles y RLS

## Alcance

Control de acceso por rol y aislamiento multi-tenant por `despacho_id` en app, SQL y edge.

## Roles actuales

- `jurista`: operacion diaria de expedientes, misiones y quizzes de su despacho.
- `admin`: capacidades adicionales de revision/entrenamiento.

## Evidencia en codigo

- Roles/guards:
  - `lib/auth/roles.ts`
  - `lib/auth/guards.ts`
- Rutas protegidas:
  - `app/(dashboard)/admin/revisiones/page.tsx`
- Perfil y despacho:
  - `lib/auth/profile.ts`

## Evidencia SQL

- Esquema base y trigger de perfil: `supabase/001_initial_schema.sql`
- Politicas RLS: `supabase/002_rls_policies.sql`
- Hardening adicional: `supabase/010_security_hardening_checks.sql`

## Matriz resumida de acceso esperado

- Expedientes/documentos/sujetos/facturas:
  - `jurista`: CRUD solo en su despacho.
  - `admin`: CRUD solo en su despacho.
- Revisiones admin:
  - `jurista`: denegado.
  - `admin`: permitido.

## Riesgos y acciones

- `P0`: evitar drift entre tablas nuevas y politicas RLS.
- `P1`: automatizar pruebas de permisos por rol.
- `P1`: checklist recurrente por release de seguridad y datos.
