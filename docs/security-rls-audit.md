# Security, Roles and RLS Audit

## Matriz de acceso esperada

| Recurso | jurista | admin |
| --- | --- | --- |
| `dashboard` | read | read |
| `expedientes` | CRUD (solo despacho) | CRUD (solo despacho) |
| `documentos` | CRUD (solo despacho) | CRUD (solo despacho) |
| `misiones` | crear/ejecutar runs propios despacho | idem + revisar entrenamiento |
| `quizzes` | resolver y ver intentos propios despacho | idem |
| `admin/revisiones` | denegado | permitido |

## Validaciones implementadas en app

- Guards server-side:
  - `lib/auth/guards.ts`
  - `lib/auth/roles.ts`
- Rutas admin con verificacion de rol:
  - `app/(dashboard)/admin/revisiones/page.tsx`
- Filtro por despacho en paginas de detalle:
  - `app/(dashboard)/misiones/runs/[id]/page.tsx`

## Riesgos detectados

1. **Drift de politicas RLS** entre tablas nuevas y politicas historicas.
2. **Acciones server sin chequeo uniforme** de errores en deletes/borrados.
3. **Falta de pruebas de regresion de permisos** en release.

## Controles sugeridos por release

- Ejecutar checklist funcional de `docs/ius-qa-checklist.md`.
- Verificar que toda accion admin valida `isAdmin`.
- Confirmar que toda tabla nueva con datos de negocio tenga:
  - `enable row level security`
  - policies `select/insert/update/delete` por `despacho`.
